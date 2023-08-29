import React from 'react';
import { Domain, EntityType, Owner, SearchInsight } from '../../../../types.generated';
import DefaultPreviewCard from '../../../preview/DefaultPreviewCard';
import { useEntityRegistry } from '../../../useEntityRegistry';
import { IconStyleType } from '../../Entity';
import DomainEntitiesSnippet from './DomainEntitiesSnippet';

export const Preview = ({
    domain,
    urn,
    name,
    description,
    owners,
    insights,
    logoComponent,
}: {
    domain: Domain;
    urn: string;
    name: string;
    description?: string | null;
    owners?: Array<Owner> | null;
    insights?: Array<SearchInsight> | null;
    logoComponent?: JSX.Element;
}): JSX.Element => {
    const entityRegistry = useEntityRegistry();
    return (
        <DefaultPreviewCard
            url={entityRegistry.getEntityUrl(EntityType.Domain, urn)}
            name={name || ''}
            urn={urn}
            description={description || ''}
            type="Domain"
            typeIcon={entityRegistry.getIcon(EntityType.Domain, 14, IconStyleType.ACCENT)}
            owners={owners}
            insights={insights}
            logoComponent={logoComponent}
            snippet={<DomainEntitiesSnippet domain={domain} />}
        />
    );
};
