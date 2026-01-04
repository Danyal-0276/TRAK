import React from 'react';
import { Tag } from './Tag';

export function SubcategoriesContainer({ mainTag, subcategories, selectedTags, onSubTagPress }) {
    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginLeft: '20px',
            marginBottom: '10px',
            gap: '5px',
        }}>
            {subcategories.map((subTag, index) => (
                <Tag
                    key={index}
                    label={subTag}
                    isSelected={selectedTags.includes(subTag)}
                    onPress={() => onSubTagPress(mainTag, subTag)}
                    isSubTag={true}
                />
            ))}
        </div>
    );
}


