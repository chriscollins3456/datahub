import { Popover, Tag, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Owner } from '../../../../../../types.generated';
import { HoverEntityTooltip } from '../../../../../recommendations/renderer/component/HoverEntityTooltip';
import { CustomAvatar } from '../../../../../shared/avatar';
import { getDescriptionFromType, getNameFromType } from '../../../containers/profile/sidebar/Ownership/ownershipUtils';

const OwnerTag = styled(Tag)`
    padding: 2px;
    padding-right: 6px;
    margin-bottom: 8px;
    display: inline-flex;
    align-items: center;
`;

interface Props {
    name: string;
    owner: Owner;
    onClose: (e: any) => void;
    entityUrn?: string;
    hidePopOver?: boolean;
    pictureLink?: string;
    readOnly?: boolean;
}

export default function OwnerContent({ name, owner, onClose, entityUrn, hidePopOver, pictureLink, readOnly }: Props) {
    return (
        <HoverEntityTooltip entity={owner.owner}>
            <Popover
                overlayStyle={{ maxWidth: 200 }}
                placement="bottom"
                title={<Typography.Text strong>{getNameFromType(owner.type)}</Typography.Text>}
                content={<Typography.Text type="secondary">{getDescriptionFromType(owner.type)}</Typography.Text>}
                style={hidePopOver ? { display: 'none' } : {}}
            >
                <OwnerTag onClose={onClose} closable={!!entityUrn && !readOnly}>
                    <CustomAvatar name={name} photoUrl={pictureLink} useDefaultAvatar={false} />
                    {name}
                </OwnerTag>
            </Popover>
        </HoverEntityTooltip>
    );
}
