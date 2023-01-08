import { LoadingOutlined } from '@ant-design/icons';
import { QueryHookOptions, QueryResult } from '@apollo/client';
import { Divider } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { EntityType, Exact } from '../../../../types.generated';
import { SidebarDomainSection } from '../containers/profile/sidebar/Domain/SidebarDomainSection';
import { SidebarOwnerSection } from '../containers/profile/sidebar/Ownership/SidebarOwnerSection';
import { SidebarTagsSection } from '../containers/profile/sidebar/SidebarTagsSection';
import { getDataForEntityType } from '../containers/profile/utils';
import EntityContext from '../EntityContext';
import { combineEntityDataWithSiblings } from '../siblingUtils';
import { GenericEntityProperties } from '../types';
import AboutSection from './AboutSection';
import ExtensionHeader from './ExtensionHeader';
import UpstreamHealth from './UpstreamHealth';

const LoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 85vh;
    font-size: 50px;
`;

const StyledDivider = styled(Divider)`
    margin: 16px 0;
`;

interface Props<T> {
    urn: string;
    entityType: EntityType;
    useEntityQuery: (
        baseOptions: QueryHookOptions<
            T,
            Exact<{
                urn: string;
            }>
        >,
    ) => QueryResult<
        T,
        Exact<{
            urn: string;
        }>
    >;
    getOverrideProperties: (T) => GenericEntityProperties;
}

export default function ExtensionProfile<T>({ urn, entityType, getOverrideProperties, useEntityQuery }: Props<T>) {
    const {
        loading,
        data: dataNotCombinedWithSiblings,
        refetch,
    } = useEntityQuery({
        variables: { urn },
    });

    const dataCombinedWithSiblings = combineEntityDataWithSiblings(dataNotCombinedWithSiblings);

    const entityData =
        (dataCombinedWithSiblings &&
            Object.keys(dataCombinedWithSiblings).length > 0 &&
            getDataForEntityType({
                data: dataCombinedWithSiblings[Object.keys(dataCombinedWithSiblings)[0]],
                entityType,
                getOverrideProperties,
                isHideSiblingMode: false,
            })) ||
        null;

    return (
        <EntityContext.Provider
            value={{
                urn,
                entityType,
                entityData,
                baseEntity: dataCombinedWithSiblings,
                dataNotCombinedWithSiblings,
                routeToTab: () => {}, // TODO - make this optional in EntityContext type
                refetch,
                lineage: undefined,
            }}
        >
            {loading && (
                <LoadingWrapper>
                    <LoadingOutlined />
                </LoadingWrapper>
            )}
            {!loading && entityData && (
                <>
                    <ExtensionHeader />
                    <StyledDivider />
                    <UpstreamHealth />
                    <StyledDivider />
                    <AboutSection />
                    <StyledDivider />
                    <SidebarOwnerSection readOnly />
                    <StyledDivider />
                    <SidebarTagsSection readOnly properties={{ hasTags: true, hasTerms: true }} />
                    <StyledDivider />
                    <SidebarDomainSection readOnly />
                </>
            )}
        </EntityContext.Provider>
    );
}
