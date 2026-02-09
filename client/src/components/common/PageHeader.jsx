import React from 'react';
import { Typography, Card, Space, Divider } from 'antd';

const { Title, Text } = Typography;

const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  backgroundColor = '#1a365d', // Dark blue like VWINLOTTO
  titleColor = '#ffd700', // Gold color
  subtitleColor = '#ffd700', // Gold color
  style = {},
  children 
}) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <Card
      style={{
        background: backgroundColor,
        border: '2px solid #ffd700', // Gold border
        borderRadius: '20px', // More rounded like VWINLOTTO
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        marginBottom: isMobile ? '16px' : '24px',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      styles={{
        body: {
          padding: isMobile ? '12px 16px' : '16px 24px',
          textAlign: 'left',
          position: 'relative',
          zIndex: 1
        }
      }}
    >
      {/* Background pattern overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)',
        zIndex: 0
      }} />
      
      <Space direction="vertical" size={isMobile ? 'small' : 'middle'} style={{ width: '100%', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: isMobile ? '8px' : '12px' }}>
          {icon && (
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
            }}>
              {icon}
            </div>
          )}
          
          <Title 
            level={isMobile ? 4 : 3} 
            style={{ 
              color: titleColor,
              margin: 0,
              fontWeight: '600',
              fontSize: isMobile ? '18px' : '24px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.3px'
            }}
          >
            {title}
          </Title>
        </div>
        
        {subtitle && (
          <Text 
            style={{ 
              color: subtitleColor,
              fontSize: isMobile ? '12px' : '14px',
              display: 'block',
              fontWeight: '400',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              opacity: 0.9,
              textAlign: 'left'
            }}
          >
            {subtitle}
          </Text>
        )}
        
        {children}
      </Space>
    </Card>
  );
};

export default PageHeader;
