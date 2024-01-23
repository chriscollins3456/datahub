import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import EntityContext from '../../EntityContext';
import { mockEntityDataWithFieldPrompts, mockEntityData } from '../mocks';
import { EntityType } from '../../../../../types.generated';
import Form from '../Form';
import TestPageContainer from '../../../../../utils/test-utils/TestPageContainer';
import { mocks } from '../../../../../Mocks';

beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
});

describe('Form', () => {
    it('should show field-level header if there are schema field prompts', async () => {
        const { getByTestId, findByTestId } = render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <TestPageContainer>
                    <EntityContext.Provider
                        value={{
                            urn: '',
                            entityType: EntityType.Dataset,
                            entityData: mockEntityDataWithFieldPrompts,
                        }}
                    >
                        <Form formUrn="urn:li:form:1" />
                    </EntityContext.Provider>
                </TestPageContainer>
            </MockedProvider>,
        );
        // DeferredRenderComponent defers rendering for a short period, wait for that
        await waitFor(() => findByTestId('field-level-requirements'));
        expect(getByTestId('field-level-requirements')).toBeInTheDocument();
    });

    it('should not show field-level header if there are no schema field prompts', () => {
        const { queryByTestId } = render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <TestPageContainer>
                    <EntityContext.Provider
                        value={{
                            urn: '',
                            entityType: EntityType.Dataset,
                            entityData: mockEntityData,
                        }}
                    >
                        <Form formUrn="urn:li:form:3" />
                    </EntityContext.Provider>
                </TestPageContainer>
            </MockedProvider>,
        );
        expect(queryByTestId('field-level-requirements')).not.toBeInTheDocument();
    });
});
