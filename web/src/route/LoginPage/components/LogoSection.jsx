import React from 'react';
import Text from '../../../components/ui/Text';

export const LogoSection = () => (
    <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 4 }}>
                <img src="/images/whiteLogo.svg" alt="TRAK Logo" style={{ width: 90, height: 90 }} />
            </div>
            <Text variant="title" color="#fff" style={{ fontSize: 24, fontWeight: '700', letterSpacing: 4, marginTop: 12 }}>
                TRAK
            </Text>
        </div>
    </div>
);

