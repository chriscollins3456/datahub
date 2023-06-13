import React from 'react';
import styled from 'styled-components';
import { FacetFilterInput, FacetMetadata } from '../../../types.generated';
import { ANTD_GRAY } from '../../entity/shared/constants';
import { FilterMode, FilterModes, UnionType } from '../utils/constants';
import AdvancedFilters from './AdvancedFilters';
import BasicFilters from './BasicFilters';
import { SEARCH_RESULTS_FILTERS_V2_INTRO } from '../../onboarding/config/SearchOnboardingConfig';
import { FilterMode } from '../utils/types';

const SearchFiltersWrapper = styled.div<{ removePadding: boolean }>`
    border-bottom: 1px solid ${ANTD_GRAY[4]};
    padding: ${(props) => (props.removePadding ? '8px 24px 4px 24px' : '8px 24px')};
`;

interface Props {
    mode: FilterMode;
    availableFilters: FacetMetadata[];
    activeFilters: FacetFilterInput[];
    unionType: UnionType;
    onChangeFilters: (newFilters: FacetFilterInput[]) => void;
    onClearFilters: () => void;
    onChangeUnionType: (unionType: UnionType) => void;
    onChangeMode: (mode: FilterMode) => void;
}

export default function SearchFilters({
    mode,
    availableFilters,
    activeFilters,
    unionType,
    onChangeFilters,
    onClearFilters,
    onChangeUnionType,
    onChangeMode,
}: Props) {
    const isShowingBasicFilters = mode === FilterModes.BASIC;
    return (
        <SearchFiltersWrapper
            id={SEARCH_RESULTS_FILTERS_V2_INTRO}
            data-testid="search-filters-v2"
            removePadding={!isShowingBasicFilters && !!activeFilters.length}
        >
            {isShowingBasicFilters && (
                <BasicFilters
                    availableFilters={availableFilters}
                    activeFilters={activeFilters}
                    onChangeFilters={onChangeFilters}
                    onClearFilters={onClearFilters}
                    showAdvancedFilters={() => onChangeMode(FilterModes.ADVANCED)}
                />
            )}
            {!isShowingBasicFilters && (
                <AdvancedFilters
                    availableFilters={availableFilters}
                    activeFilters={activeFilters}
                    unionType={unionType}
                    onChangeFilters={onChangeFilters}
                    onChangeUnionType={onChangeUnionType}
                    showBasicFilters={() => onChangeMode(FilterModes.BASIC)}
                />
            )}
        </SearchFiltersWrapper>
    );
}
