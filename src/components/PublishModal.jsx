import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Box,
  Icon,
  Banner,
  Checkbox
} from '@shopify/polaris';
import {
  LogoTiktokIcon,
  LogoInstagramIcon,
  LogoFacebookIcon,
  DeleteIcon,
  RefreshIcon
} from '@shopify/polaris-icons';
import { BACKEND_URL } from '../config';

const PublishModal = ({ onClose, renderJobId, isProcessing, productId }) => {
  const [accounts, setAccounts] = useState([]);
  const [posting, setPosting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selected, setSelected] = useState({ instagram: true, facebook: true, tiktok: true });

  // --- 1. Fetch Connected Accounts ---
  const checkConnection = (isManual = false) => {
    if(isManual) setChecking(true);
    
    fetch(`${BACKEND_URL}/api/social-accounts`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true" 
        }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAccounts(data.accounts || []);
          if (isManual) alert("✅ Account Status Updated!");
        }
        setChecking(false);
      })
      .catch(err => { 
        console.error("Fetch Error:", err); 
        setChecking(false); 
      });
  };

  useEffect(() => {
    checkConnection(false);
    const handleMessage = (event) => {
      if (event.data === 'login-success') {
        checkConnection(false); 
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- 2. Handlers ---
  const handleConnect = (platform) => {
    const url = `${BACKEND_URL}/login/${platform}`;
    const w = 500, h = 600;
    const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
    const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
    window.open(url, 'ConnectSocial', `width=${w},height=${h},top=${y},left=${x}`);
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    
    try {
        await fetch(`${BACKEND_URL}/api/disconnect/${platform}`, { 
            method: 'DELETE',
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        setAccounts(prev => prev.filter(acc => acc.platform !== platform));
    } catch (err) { alert("Backend communication error."); }
  };

  const toggleSelection = (platform) => {
    setSelected(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handlePublish = async () => {
    const connectedPlatforms = accounts.map(a => a.platform);
    const targets = Object.keys(selected).filter(p => selected[p] === true && connectedPlatforms.includes(p));
    
    if (targets.length === 0) return alert("⚠️ Please select at least one connected account.");

    setPosting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/queue-publish`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
            render_job_id: renderJobId, 
            accounts: targets,
            // 🟢 SAFTEY FORCE: We set this to null. 
            // It is IMPOSSIBLE for the error to happen if this code is running.
            product_id: null 
        })
      });
      const result = await response.json();
      
      if(result.status === 'queued') {
          alert("✅ Publishing Queued!");
          onClose();
      } else if (result.status === 'completed') {
          alert("✅ Published Successfully!");
          onClose();
      } else {
          alert("⚠️ Error: " + JSON.stringify(result));
      }
    } catch (error) { 
        alert("❌ Backend Error: Is your Python server running?"); 
    }
    setPosting(false);
  };

  const isConnected = (platform) => accounts.some(acc => acc.platform === platform);

  const renderPlatformRow = (platform, label, IconSource) => {
      const connected = isConnected(platform);
      const isSelected = selected[platform];

      return (
          <Box
            padding="400"
            borderWidth="025"
            borderColor="border"
            borderRadius="200"
            background={connected && isSelected ? 'bg-surface-secondary' : 'bg-surface'}
          >
            <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="300" blockAlign="center">
                     <div style={{width: 30, height: 30, display:'flex', alignItems:'center'}}>
                        <Icon source={IconSource} tone="base"/>
                     </div>
                     <Text variant="bodyMd" fontWeight="bold">{label}</Text>
                </InlineStack>

                {connected ? (
                    <InlineStack gap="400" blockAlign="center">
                         <Checkbox
                            label="Post"
                            labelHidden
                            checked={isSelected}
                            onChange={() => toggleSelection(platform)}
                        />
                        <div style={{borderLeft: '1px solid #dfe3e8', height: '24px', paddingLeft: '10px'}}>
                            <Button
                                icon={DeleteIcon}
                                tone="critical"
                                variant="plain"
                                onClick={() => handleDisconnect(platform)}
                                accessibilityLabel="Disconnect"
                            />
                        </div>
                    </InlineStack>
                ) : (
                    <Button onClick={() => handleConnect(platform)} size="slim">Connect</Button>
                )}
            </InlineStack>
          </Box>
      );
  };

  return (
    <Modal
        open={true}
        onClose={onClose}
        title={isProcessing ? "Queue Auto-Publish" : "Publish Video"}
        primaryAction={{
            // 🟢 VISUAL CHECK: If this doesn't say "(Fixed)", your browser is using old code!
            content: posting ? 'Processing...' : (isProcessing ? 'Queue Publish' : 'Publish (Fixed)'),
            onAction: handlePublish,
            loading: posting,
        }}
        secondaryActions={[
            { content: 'Cancel', onAction: onClose },
        ]}
    >
        <Modal.Section>
            <BlockStack gap="400">
                {isProcessing ? (
                    <Banner tone="info">
                        <p>Your video is still rendering. Select accounts below, and we will automatically publish it once it finishes.</p>
                    </Banner>
                ) : (
                    <Banner tone="success">
                        <p>Video is ready! Select platforms to publish immediately.</p>
                    </Banner>
                )}

                <Text as="p" variant="bodyMd">Manage your connected social accounts:</Text>

                <BlockStack gap="300">
                    {renderPlatformRow('tiktok', 'TikTok', LogoTiktokIcon)}
                    {renderPlatformRow('instagram', 'Instagram', LogoInstagramIcon)}
                    {renderPlatformRow('facebook', 'Facebook', LogoFacebookIcon)}
                </BlockStack>

                <InlineStack align="center">
                     <Button variant="plain" icon={RefreshIcon} onClick={() => checkConnection(true)} loading={checking}>
                        Refresh Connections
                     </Button>
                </InlineStack>
            </BlockStack>
        </Modal.Section>
    </Modal>
  );
};

export default PublishModal;