package com.datahub.authorization.fieldresolverprovider;

import com.datahub.authentication.Authentication;
import com.datahub.authorization.FieldResolver;
import com.datahub.authorization.ResourceFieldType;
import com.datahub.authorization.ResourceSpec;
import com.linkedin.common.urn.Urn;
import com.linkedin.common.urn.UrnUtils;
import com.linkedin.domain.DomainProperties;
import com.linkedin.domain.Domains;
import com.linkedin.entity.EntityResponse;
import com.linkedin.entity.EnvelopedAspect;
import com.linkedin.entity.client.EntityClient;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Nonnull;

import static com.linkedin.metadata.Constants.*;


/**
 * Provides field resolver for domain given resourceSpec
 */
@Slf4j
@RequiredArgsConstructor
public class DomainFieldResolverProvider implements ResourceFieldResolverProvider {

  private final EntityClient _entityClient;
  private final Authentication _systemAuthentication;

  @Override
  public ResourceFieldType getFieldType() {
    return ResourceFieldType.DOMAIN;
  }

  @Override
  public FieldResolver getFieldResolver(ResourceSpec resourceSpec) {
    return FieldResolver.getResolverFromFunction(resourceSpec, this::getDomains);
  }

  private Set<Urn> getBatchedParentDomains(@Nonnull final Set<Urn> urns) {
    Set<Urn> parentUrns = new HashSet<>();

    try {
      final Map<Urn, EntityResponse> batchResponse = _entityClient.batchGetV2(
          DOMAIN_ENTITY_NAME,
          urns,
          Collections.singleton(DOMAIN_PROPERTIES_ASPECT_NAME),
          _systemAuthentication
      );

      batchResponse.forEach((urn, entityResponse) -> {
        if (entityResponse.getAspects().containsKey(DOMAIN_PROPERTIES_ASPECT_NAME)) {
          final DomainProperties properties = new DomainProperties(entityResponse.getAspects().get(DOMAIN_PROPERTIES_ASPECT_NAME).getValue().data());
          if (properties.hasParentDomain()) {
            parentUrns.add(properties.getParentDomain());
          }
        }
      });

    } catch (Exception e) {
      log.error(
          "Error while retrieving parent domains for {} urns including \"{}\"",
          urns.size(),
          urns.stream().findFirst().map(Urn::toString).orElse(""),
          e
      );
    }

    return parentUrns;
  }

  private FieldResolver.FieldValue getDomains(ResourceSpec resourceSpec) {
    System.out.println("DOMAIN LOG: getDomains");
    Urn entityUrn = UrnUtils.getUrn(resourceSpec.getResource());
    // In the case that the entity is a domain, the associated domain is the domain itself
    if (entityUrn.getEntityType().equals(DOMAIN_ENTITY_NAME)) {
      return FieldResolver.FieldValue.builder()
          .values(Collections.singleton(entityUrn.toString()))
          .build();
    }

    EnvelopedAspect domainsAspect;
    try {
      EntityResponse response = _entityClient.getV2(entityUrn.getEntityType(), entityUrn,
          Collections.singleton(DOMAINS_ASPECT_NAME), _systemAuthentication);
      System.out.println("DOMAIN LOG: response");
      if (response == null || !response.getAspects().containsKey(DOMAINS_ASPECT_NAME)) {
        System.out.println("DOMAIN LOG: bail");
        return FieldResolver.emptyFieldValue();
      }
      domainsAspect = response.getAspects().get(DOMAINS_ASPECT_NAME);
    } catch (Exception e) {
      log.error("Error while retrieving domains aspect for urn {}", entityUrn, e);
      return FieldResolver.emptyFieldValue();
    }

    Set<Urn> domainUrns = new HashSet<>(new Domains(domainsAspect.getValue().data()).getDomains());
    System.out.println("DOMAIN LOG: domainUrns=" + domainUrns.size());
    Set<Urn> batchedParentUrns = getBatchedParentDomains(domainUrns);
    System.out.println("DOMAIN LOG: batched=" + batchedParentUrns.size());

    while (!batchedParentUrns.isEmpty()) {
      System.out.println("DOMAIN LOG: add stuff");
      domainUrns.addAll(batchedParentUrns);
      batchedParentUrns = getBatchedParentDomains(batchedParentUrns);
    }

    return FieldResolver.FieldValue.builder().values(domainUrns
        .stream()
        .map(Object::toString)
        .collect(Collectors.toSet())).build();
  }
}
