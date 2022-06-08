import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { Alert, Button, Drawer } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { Message } from '../shared/Message';
import { useEntityRegistry } from '../useEntityRegistry';
import CompactContext from '../shared/CompactContext';
import { EntityAndType, EntitySelectParams, FetchedEntities } from './types';
import LineageViz from './LineageViz';
import extendAsyncEntities from './utils/extendAsyncEntities';
import useGetEntityQuery from './utils/useGetEntityQuery';
import { EntityType } from '../../types.generated';
import { capitalizeFirstLetter } from '../shared/textUtil';
import { ANTD_GRAY } from '../entity/shared/constants';
import useGetEntityLineageQuery from './utils/useGetEntityLineageQuery';

const DEFAULT_DISTANCE_FROM_TOP = 106;

const LoadingMessage = styled(Message)`
    margin-top: 10%;
`;
const FooterButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
`;

const EntityDrawer = styled(Drawer)<{ distanceFromTop: number }>`
    top: ${(props) => props.distanceFromTop}px;
    z-index: 1;
    height: calc(100vh - ${(props) => props.distanceFromTop}px);
    .ant-drawer-content-wrapper {
        border-right: 1px solid ${ANTD_GRAY[4.5]};
        box-shadow: none !important;
    }
`;

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

type Props = {
    urn: string;
    type: EntityType;
};

export default function LineageExplorer({ urn, type }: Props) {
    const previousUrn = usePrevious(urn);
    const history = useHistory();

    const entityRegistry = useEntityRegistry();

    const { loading: lineageLoading, error: lineageError, data: lineageData } = useGetEntityLineageQuery(urn, type);
    const { loading, error, data } = useGetEntityQuery(urn, type);
    const combinedData: EntityAndType | null | undefined = useMemo(
        () =>
            data && lineageData
                ? ({ type: data.type, entity: { ...data.entity, ...lineageData } } as EntityAndType)
                : undefined,
        [data, lineageData],
    );

    const [isDrawerVisible, setIsDrawVisible] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<EntitySelectParams | undefined>(undefined);
    const [asyncEntities, setAsyncEntities] = useState<FetchedEntities>({});

    const drawerRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

    const maybeAddAsyncLoadedEntity = useCallback(
        (entityAndType: EntityAndType) => {
            if (entityAndType?.entity.urn && !asyncEntities[entityAndType?.entity.urn]?.fullyFetched) {
                // record that we have added this entity
                let newAsyncEntities = extendAsyncEntities(asyncEntities, entityRegistry, entityAndType, true);
                const config = entityRegistry.getLineageVizConfig(entityAndType.type, entityAndType.entity);

                config?.downstreamChildren?.forEach((downstream) => {
                    newAsyncEntities = extendAsyncEntities(newAsyncEntities, entityRegistry, downstream, false);
                });
                config?.upstreamChildren?.forEach((downstream) => {
                    newAsyncEntities = extendAsyncEntities(newAsyncEntities, entityRegistry, downstream, false);
                });
                setAsyncEntities(newAsyncEntities);
            }
        },
        [asyncEntities, setAsyncEntities, entityRegistry],
    );

    const handleClose = () => {
        setIsDrawVisible(false);
        setSelectedEntity(undefined);
    };

    useEffect(() => {
        if (type && combinedData) {
            maybeAddAsyncLoadedEntity(combinedData);
        }
    }, [combinedData, asyncEntities, setAsyncEntities, maybeAddAsyncLoadedEntity, urn, previousUrn, type]);

    if (error || (!loading && !error && !data) || lineageError || (!lineageLoading && !lineageError && !lineageData)) {
        return <Alert type="error" message={error?.message || 'Entity failed to load'} />;
    }

    const drawerDistanceFromTop =
        drawerRef && drawerRef.current ? drawerRef.current.offsetTop : DEFAULT_DISTANCE_FROM_TOP;

    return (
        <>
            {(loading || lineageLoading) && <LoadingMessage type="loading" content="Loading..." />}
            {!!data && !!lineageData && (
                <div>
                    <LineageViz
                        selectedEntity={selectedEntity}
                        fetchedEntities={asyncEntities}
                        entityAndType={combinedData}
                        onEntityClick={(params: EntitySelectParams) => {
                            setIsDrawVisible(true);
                            setSelectedEntity(params);
                        }}
                        onEntityCenter={(params: EntitySelectParams) => {
                            history.push(
                                `${entityRegistry.getEntityUrl(params.type, params.urn)}/?is_lineage_mode=true`,
                            );
                        }}
                        onLineageExpand={(asyncData: EntityAndType) => {
                            maybeAddAsyncLoadedEntity(asyncData);
                        }}
                    />
                </div>
            )}
            <div ref={drawerRef} />
            <EntityDrawer
                distanceFromTop={drawerDistanceFromTop}
                placement="left"
                closable={false}
                onClose={handleClose}
                visible={isDrawerVisible}
                width={490}
                mask={false}
                footer={
                    selectedEntity && (
                        <FooterButtonGroup>
                            <Button onClick={handleClose} type="text">
                                Close
                            </Button>
                            <Button href={entityRegistry.getEntityUrl(selectedEntity.type, selectedEntity.urn)}>
                                <InfoCircleOutlined /> {capitalizeFirstLetter(selectedEntity.type)} Details
                            </Button>
                        </FooterButtonGroup>
                    )
                }
            >
                <CompactContext.Provider value>
                    {selectedEntity && entityRegistry.renderProfile(selectedEntity.type, selectedEntity.urn)}
                </CompactContext.Provider>
            </EntityDrawer>
        </>
    );
}
