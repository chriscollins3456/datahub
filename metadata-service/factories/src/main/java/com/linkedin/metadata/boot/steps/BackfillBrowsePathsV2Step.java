package com.linkedin.metadata.boot.steps;

import com.google.common.collect.ImmutableSet;
import com.linkedin.common.AuditStamp;
import com.linkedin.common.BrowsePathsV2;
import com.linkedin.common.urn.Urn;
import com.linkedin.events.metadata.ChangeType;
import com.linkedin.metadata.Constants;
import com.linkedin.metadata.boot.UpgradeStep;
import com.linkedin.metadata.entity.EntityService;
import com.linkedin.metadata.query.ListUrnsResult;
import com.linkedin.metadata.utils.GenericRecordUtils;
import com.linkedin.mxe.MetadataChangeProposal;
import com.linkedin.mxe.SystemMetadata;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Nonnull;
import java.util.Set;

@Slf4j
public class BackfillBrowsePathsV2Step extends UpgradeStep {

  private static final Set<String> ENTITY_TYPES_TO_MIGRATE = ImmutableSet.of(
      Constants.DATASET_ENTITY_NAME,
      Constants.DASHBOARD_ENTITY_NAME,
      Constants.CHART_ENTITY_NAME,
      Constants.DATA_JOB_ENTITY_NAME,
      Constants.DATA_FLOW_ENTITY_NAME,
      Constants.ML_MODEL_ENTITY_NAME,
      Constants.ML_MODEL_GROUP_ENTITY_NAME,
      Constants.ML_FEATURE_TABLE_ENTITY_NAME,
      Constants.ML_FEATURE_ENTITY_NAME
  );
  private static final String VERSION = "1";
  private static final String UPGRADE_ID = "backfill-default-browse-paths-v2-step";
  private static final Integer BATCH_SIZE = 5000;

  public BackfillBrowsePathsV2Step(EntityService entityService) {
    super(entityService, VERSION, UPGRADE_ID);
  }

  @Nonnull
  @Override
  public ExecutionMode getExecutionMode() {
    return ExecutionMode.BLOCKING; // ensure there are no write conflicts.
  }

  @Override
  public void upgrade() throws Exception {
    final AuditStamp auditStamp =
        new AuditStamp().setActor(Urn.createFromString(Constants.SYSTEM_ACTOR)).setTime(System.currentTimeMillis());

    int total = 0;
    for (String entityType : ENTITY_TYPES_TO_MIGRATE) {
      int migratedCount = 0;
      do {
        log.info(String.format("Upgrading batch %s-%s out of %s of browse paths for entity type %s",
            migratedCount, migratedCount + BATCH_SIZE, total, entityType));
        total = backfillBrowsePathsV2(entityType, migratedCount, auditStamp);
        migratedCount += BATCH_SIZE;
      } while (migratedCount < total);
    }
  }

  private int backfillBrowsePathsV2(String entityType, int start, AuditStamp auditStamp)
      throws Exception {

    final ListUrnsResult entityUrnsResult = _entityService.listUrns(entityType, start, BATCH_SIZE);

    if (entityUrnsResult.getTotal() == 0 || entityUrnsResult.getEntities().size() == 0) {
      log.debug(String.format("Found 0 entity of type %s. Skipping backfill for this entity", entityType));
      return 0;
    }

    for (Urn urn : entityUrnsResult.getEntities()) {
      ingestBrowsePathsV2(urn, auditStamp);
    }

    return entityUrnsResult.getTotal();
  }

  private void ingestBrowsePathsV2(Urn urn, AuditStamp auditStamp) throws Exception {
    BrowsePathsV2 browsePathsV2 = _entityService.buildDefaultBrowsePathV2(urn, true);
    log.debug(String.format("Adding browse path v2 for urn %s with value %s", urn, browsePathsV2));
    MetadataChangeProposal proposal = new MetadataChangeProposal();
    proposal.setEntityUrn(urn);
    proposal.setEntityType(urn.getEntityType());
    proposal.setAspectName(Constants.BROWSE_PATHS_V2_ASPECT_NAME);
    proposal.setChangeType(ChangeType.UPSERT);
    proposal.setSystemMetadata(new SystemMetadata().setRunId(EntityService.DEFAULT_RUN_ID).setLastObserved(System.currentTimeMillis()));
    proposal.setAspect(GenericRecordUtils.serializeAspect(browsePathsV2));
    _entityService.ingestProposal(
        proposal,
        auditStamp,
        false
    );
  }
}
