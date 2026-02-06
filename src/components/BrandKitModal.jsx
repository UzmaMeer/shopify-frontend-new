import React, { useState, useEffect } from 'react';
import {
  Modal,
  FormLayout,
  TextField,
  Select,
  BlockStack,
  InlineStack,
  Text
  // 🟢 REMOVED: 'Box' (Not used)
} from '@shopify/polaris';

const BrandKitModal = ({ onClose, shopName, backendUrl }) => {
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#000000');
    const [fontChoice, setFontChoice] = useState('Roboto');
    const [ctaText, setCtaText] = useState('Shop Now');
    const [saving, setSaving] = useState(false);

    // Load existing settings
    useEffect(() => {
        fetch(`${backendUrl}/api/get-brand-settings?shop=${shopName}`, {
             headers: { "ngrok-skip-browser-warning": "true" }
        })
        .then(res => res.json())
        .then(data => {
            if(data && !data.error) {
                setLogoUrl(data.logo_url || '');
                setPrimaryColor(data.primary_color || '#000000');
                setFontChoice(data.font_choice || 'Roboto');
                setCtaText(data.cta_text || 'Shop Now');
            }
        });
    }, [shopName, backendUrl]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${backendUrl}/api/save-brand-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({
                    shop: shopName,
                    logo_url: logoUrl,
                    primary_color: primaryColor,
                    font_choice: fontChoice,
                    cta_text: ctaText
                })
            });
            onClose(); 
        } catch (e) {
            console.error("Save failed", e);
        }
        setSaving(false);
    };

    const fontOptions = [
        {label: 'Roboto (Clean)', value: 'Roboto'},
        {label: 'Playfair (Elegant)', value: 'Playfair Display'},
        {label: 'Oswald (Bold)', value: 'Oswald'},
    ];

    return (
        <Modal
            open={true}
            onClose={onClose}
            title="🎨 Brand Kit Settings"
            primaryAction={{
                content: saving ? 'Saving...' : 'Save Settings',
                onAction: handleSave,
                loading: saving,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <FormLayout>
                    <TextField
                        label="Logo URL"
                        value={logoUrl}
                        onChange={(value) => setLogoUrl(value)}
                        placeholder="https://..."
                        autoComplete="off"
                        helpText="Paste the direct link to your transparent logo PNG."
                    />

                    <BlockStack gap="200">
                        <Text as="label" variant="bodyMd">Primary Brand Color</Text>
                        <InlineStack gap="300" blockAlign="center">
                            <div style={{
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '4px', 
                                overflow: 'hidden', 
                                border: '1px solid #ccc'
                            }}>
                                <input 
                                    type="color" 
                                    value={primaryColor} 
                                    onChange={(e) => setPrimaryColor(e.target.value)} 
                                    style={{
                                        width: '150%', 
                                        height: '150%', 
                                        margin: '-25%', 
                                        cursor: 'pointer'
                                    }} 
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <TextField
                                    label="Brand Color"
                                    labelHidden
                                    value={primaryColor}
                                    onChange={(value) => setPrimaryColor(value)}
                                    autoComplete="off"
                                />
                            </div>
                        </InlineStack>
                    </BlockStack>

                    <Select
                        label="Font Style"
                        options={fontOptions}
                        onChange={(value) => setFontChoice(value)}
                        value={fontChoice}
                    />

                    <TextField
                        label="Default CTA Text"
                        value={ctaText}
                        onChange={(value) => setCtaText(value)}
                        autoComplete="off"
                        placeholder="e.g. Shop Now"
                    />
                </FormLayout>
            </Modal.Section>
        </Modal>
    );
};

export default BrandKitModal;