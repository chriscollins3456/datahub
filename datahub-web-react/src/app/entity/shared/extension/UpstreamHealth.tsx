import { blue, green, orange, red } from '@ant-design/colors';
import {
    CheckCircleFilled,
    DownOutlined,
    LoadingOutlined,
    QuestionCircleOutlined,
    WarningFilled,
} from '@ant-design/icons';
import { Typography } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useSearchAcrossLineageQuery } from '../../../../graphql/search.generated';
import { EntityType, FilterOperator, LineageDirection } from '../../../../types.generated';
import { useEntityRegistry } from '../../../useEntityRegistry';
import { ANTD_GRAY } from '../constants';
import { useEntityData } from '../EntityContext';
import ExternalLink from './link_out.svg';

const LoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
`;

const TextWrapper = styled.span`
    font-size: 16px;
    line-height: 24px;
    margin-left: 8px;
`;

const UnknownText = styled.span`
    font-size: 14px;
    line-height: 20px;
    margin-left: 8px;
`;

const StyledQuestion = styled(QuestionCircleOutlined)`
    color: ${ANTD_GRAY[7]};
`;

const StyledCheck = styled(CheckCircleFilled)`
    color: ${green[6]};
    font-size: 14px;
`;

const StyledWarning = styled(WarningFilled)`
    color: ${orange[5]};
    font-size: 14px;
`;

const FailingDetailsWrapper = styled.span`
    font-size: 14px;
    color: ${ANTD_GRAY[8]};
    margin-left: 8px;

    &:hover {
        cursor: pointer;
        color: ${blue[5]};
    }
`;

const StyledArrow = styled(DownOutlined)<{ isOpen: boolean }>`
    font-size: 12px;
    margin-left: 3px;
    ${(props) =>
        props.isOpen &&
        `
        transform: rotate(180deg);
        padding-top: 1px;
    `}
`;

const FailingSectionWrapper = styled.div`
    margin: 5px 0 0 34px;
    font-size: 14px;
    color: black;
`;

const FailingDataWrapper = styled.div`
    margin-left: 20px;
`;

const DatasetWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-top: 3px;
`;

const AssertionsSummaryWrapper = styled.span`
    font-size: 10px;
    font-weight: 700;
    line-height: 13px;
    color: ${red[7]};
    border: 1px solid ${red[7]};
    border-radius: 8px;
    margin-left: 5px;
    padding: 0 3px;
    letter-spacing: 0.2px;
`;

const StyledLink = styled(Typography.Link)`
    display: flex;
    color: ${blue[5]};

    img {
        margin-right: 3px;
    }
`;

function extractUpstreamSummary(datasetUpstreams) {
    if (datasetUpstreams === undefined) {
        return undefined;
    }

    let passingUpstreams = 0;
    let failingUpstreams = 0;
    let unknownUpstreams = 0;
    const failingDatasets = new Set();

    datasetUpstreams.forEach((dataset) => {
        dataset.assertions?.assertions?.forEach((assertion) => {
            if (assertion?.runEvents?.total > 0) {
                const failingForDataset = assertion?.runEvents?.failed;
                if (failingForDataset > 0) {
                    failingUpstreams += +1;
                    failingDatasets.add(dataset);
                } else {
                    passingUpstreams += +1;
                }
            } else {
                unknownUpstreams += +1;
            }
        });
    });

    return {
        failing: failingUpstreams,
        passing: passingUpstreams,
        unknown: unknownUpstreams,
        failingDatasets: Array.from(failingDatasets),
    };
}

export default function UpstreamHealth() {
    const entityRegistry = useEntityRegistry();
    const [areFailingDetailsVisible, setAreFailingDetailsVisible] = useState(false);
    const { entityData } = useEntityData();
    const { data, loading } = useSearchAcrossLineageQuery({
        variables: {
            input: {
                urn: entityData?.urn || '',
                query: '*',
                types: [EntityType.Dataset],
                start: 0,
                count: 1000,
                direction: LineageDirection.Upstream,
                orFilters: [{ and: [{ field: 'degree', condition: FilterOperator.Equal, values: ['1', '2', '3+'] }] }],
            },
            includeAssertions: true,
        },
    });

    const upstreamSummary = extractUpstreamSummary(
        data?.searchAcrossLineage?.searchResults?.map((result) => result.entity),
    );

    if (loading) {
        return (
            <LoadingWrapper>
                <LoadingOutlined />
            </LoadingWrapper>
        );
    }

    if (!data) return null;

    if (upstreamSummary?.failing !== undefined && upstreamSummary.failing > 0) {
        return (
            <div>
                <StyledWarning />
                <TextWrapper>Unhealthy Data Inputs</TextWrapper>
                <FailingDetailsWrapper onClick={() => setAreFailingDetailsVisible(!areFailingDetailsVisible)}>
                    view details <StyledArrow isOpen={areFailingDetailsVisible} />
                </FailingDetailsWrapper>
                {areFailingDetailsVisible && (
                    <FailingSectionWrapper>
                        {upstreamSummary.failingDatasets.length} data source{upstreamSummary.failing > 1 && 's'} with
                        failing assertions
                        <FailingDataWrapper>
                            {upstreamSummary.failingDatasets.map((dataset: any) => {
                                const displayName = entityRegistry.getDisplayName(dataset.type, dataset);
                                const pathName = entityRegistry.getPathName(dataset.type);
                                const link = `${window.location.origin}/${pathName}/${dataset.urn}`;

                                const totalNumAssertions = dataset.assertions.assertions.length;
                                let numFailing = 0;

                                dataset.assertions.assertions.forEach((assertion) => {
                                    if (assertion.runEvents.failed > 0) {
                                        numFailing += 1;
                                    }
                                });

                                return (
                                    <DatasetWrapper>
                                        <StyledLink href={link} target="_blank" rel="noopener noreferrer">
                                            <img src={ExternalLink} alt="link" /> {displayName}
                                        </StyledLink>
                                        <AssertionsSummaryWrapper>
                                            {numFailing} of {totalNumAssertions} failing
                                        </AssertionsSummaryWrapper>
                                    </DatasetWrapper>
                                );
                            })}
                        </FailingDataWrapper>
                    </FailingSectionWrapper>
                )}
            </div>
        );
    }

    if (upstreamSummary?.passing !== undefined && upstreamSummary.passing > 0) {
        return (
            <div>
                <StyledCheck />
                <TextWrapper>Healthy Data Inputs</TextWrapper>
            </div>
        );
    }

    return (
        <div>
            <StyledQuestion />
            <UnknownText>0 upstream assertions</UnknownText>
        </div>
    );
}
