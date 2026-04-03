import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const getNavLinkStyle = ({ isActive }) => {
    if (isActive) {
      return {
        backgroundColor: 'rgba(0,229,184,0.12)',
        color: '#00E5B8',
        border: '1px solid rgba(0,229,184,0.3)',
        borderRadius: '8px',
        padding: '6px 14px',
        textDecoration: 'none',
        transition: 'all 0.2s',
        fontWeight: 500,
        fontSize: '14px'
      };
    }
    return {
      color: '#566580',
      padding: '6px 14px',
      textDecoration: 'none',
      border: '1px solid transparent',
      transition: 'all 0.2s',
      fontWeight: 500,
      fontSize: '14px'
    };
  };

  return (
    <nav
      style={{
        height: '64px',
        backgroundColor: '#080C14',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#00E5B8',
            color: '#080C14',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}
        >
          FT
        </div>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#EEF2FF' }}>
          FinTwin
        </span>
      </div>

      {/* Center: Links */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <NavLink to="/twin" style={getNavLinkStyle}>Twin Home</NavLink>
        <NavLink to="/simulator" style={getNavLinkStyle}>Simulator</NavLink>
        <NavLink to="/investments" style={getNavLinkStyle}>Investments</NavLink>
        <NavLink to="/rebalance" style={getNavLinkStyle}>Rebalance</NavLink>
        <NavLink to="/projections" style={getNavLinkStyle}>Projections</NavLink>
      </div>

      {/* Right: Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00E5B8 0%, #00B28F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#080C14',
          fontSize: '12px',
          fontWeight: 600
        }}
      >
        AR
      </div>
    </nav>
  );
};

export default Navbar;
