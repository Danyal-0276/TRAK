// ============================================
// FILE: components/TagSelection/SubcategoriesContainer.jsx
// ============================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tag } from './Tag';

export function SubcategoriesContainer({ mainTag, subcategories, selectedTags, onSubTagPress }) {
    return (
        <View style={styles.subcategoriesContainer}>
            {subcategories.map((subTag, subIndex) => {
                const isSubSelected = selectedTags.includes(subTag);
                return (
                    <Tag
                        key={`${mainTag}-${subIndex}`}
                        label={subTag}
                        isSelected={isSubSelected}
                        onPress={() => onSubTagPress(mainTag, subTag)}
                        isSubTag={true}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    subcategoriesContainer: {
        flexBasis: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'flex-start',
        marginTop: 2,
        marginBottom: 4,
        paddingLeft: 2,
    },
});