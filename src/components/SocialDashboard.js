import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  TextField,
  Select,
  BlockStack,
  InlineStack,
  Banner,
  Box,
  Badge,
  Icon,
  Divider
} from '@shopify/polaris';
import {
  LogoFacebookIcon,
  LogoInstagramIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SendIcon,
  CalendarIcon
} from '@shopify/polaris-icons';

const SocialDashboard = () => {
  // 1. State for managing Connected Accounts
  const [accounts, setAccounts] = useState({
    facebook: false,
    instagram: false
  });

  // 2. State for handling the new post form
  const [postContent, setPostContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  // 3. State for storing Published Posts
  const [publishedPosts, setPublishedPosts] = useState([
    { id: 1, platform: 'instagram', content: 'Sale is live now! #Shopify', date: '2025-12-30 10:00 AM', status: 'Published' }
  ]);

  // Mock function to simulate connecting an account
  const toggleConnection = (platform) => {
    setAccounts(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Function to handle "Post Now"
  const handlePost = () => {
    if (!postContent) return; // Polaris handles validation UI usually, but simple return here
    
    const newPost = {
      id: Date.now(),
      platform: selectedPlatform === 'all' ? 'Facebook & Instagram' : selectedPlatform,
      content: postContent,
      date: new Date().toLocaleString(),
      status: 'Published'
    };

    setPublishedPosts([newPost, ...publishedPosts]);
    setPostContent(""); 
  };

  // Options for Select
  const platformOptions = [
      {label: 'All Connected Platforms', value: 'all'},
      ...(accounts.facebook ? [{label: 'Facebook Page', value: 'Facebook'}] : []),
      ...(accounts.instagram ? [{label: 'Instagram Business', value: 'Instagram'}] : []),
  ];

  return (
    <Page title="Social Media Manager" fullWidth>
      <Layout>
        
        {/* SECTION 1: CONNECT ACCOUNTS */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">1. Connect Your Accounts</Text>
              <InlineStack gap="300">
                <Button 
                  icon={LogoFacebookIcon} 
                  onClick={() => toggleConnection('facebook')}
                  variant={accounts.facebook ? 'primary' : 'secondary'}
                  tone={accounts.facebook ? 'success' : undefined}
                >
                  {accounts.facebook ? 'Facebook Connected' : 'Connect Facebook'}
                </Button>
                
                <Button 
                  icon={LogoInstagramIcon} 
                  onClick={() => toggleConnection('instagram')}
                  variant={accounts.instagram ? 'primary' : 'secondary'}
                  tone={accounts.instagram ? 'critical' : undefined} // Instagram brand color is tricky in Polaris, usually critical/pinkish
                >
                  {accounts.instagram ? 'Instagram Connected' : 'Connect Instagram'}
                </Button>
              </InlineStack>
              
              {/* Visual checkmark feedback */}
              {(accounts.facebook || accounts.instagram) && (
                  <InlineStack gap="200" align="start">
                      {accounts.facebook && <Badge tone="success">Facebook Active</Badge>}
                      {accounts.instagram && <Badge tone="critical">Instagram Active</Badge>}
                  </InlineStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* SECTION 2: CREATE POST */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">2. Create New Post</Text>
              
              {(!accounts.facebook && !accounts.instagram) ? (
                <Banner tone="warning" icon={AlertCircleIcon}>
                  <p>Please connect at least one social account above to start posting.</p>
                </Banner>
              ) : (
                <BlockStack gap="400">
                  <Select
                    label="Post to"
                    options={platformOptions}
                    onChange={(val) => setSelectedPlatform(val)}
                    value={selectedPlatform}
                  />

                  <TextField
                    label="Caption"
                    value={postContent}
                    onChange={(val) => setPostContent(val)}
                    multiline={4}
                    placeholder="Write your caption here..."
                    autoComplete="off"
                  />

                  <InlineStack align="end">
                    <Button 
                        variant="primary" 
                        icon={SendIcon} 
                        onClick={handlePost}
                        disabled={!postContent}
                    >
                        Publish Now
                    </Button>
                  </InlineStack>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* SECTION 3: RECENT ACTIVITY */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">3. Recent Activity (Live Feed)</Text>
              
              {publishedPosts.length === 0 ? (
                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <Text tone="subdued" alignment="center">No posts yet.</Text>
                </Box>
              ) : (
                <BlockStack gap="0">
                  {publishedPosts.map((post, index) => (
                    <Box key={post.id}>
                        {index > 0 && <Divider />}
                        <Box padding="400">
                            <BlockStack gap="200">
                                <InlineStack align="space-between">
                                    <InlineStack gap="200">
                                        {/* Icon based on platform */}
                                        {post.platform.toLowerCase().includes('facebook') && <Icon source={LogoFacebookIcon} tone="base"/>}
                                        {post.platform.toLowerCase().includes('instagram') && <Icon source={LogoInstagramIcon} tone="base"/>}
                                        <Text variant="bodyMd" fontWeight="bold">{post.platform}</Text>
                                    </InlineStack>
                                    <Badge tone="success" progress="complete">{post.status}</Badge>
                                </InlineStack>
                                
                                <Text variant="bodyMd" as="p">{post.content}</Text>
                                
                                <InlineStack gap="100" align="start">
                                    <Icon source={CalendarIcon} tone="subdued" />
                                    <Text variant="bodySm" tone="subdued">{post.date}</Text>
                                </InlineStack>
                            </BlockStack>
                        </Box>
                    </Box>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
};

export default SocialDashboard;