import React, { useState } from 'react';
import { Dropdown, Menu, message } from 'antd';

const ContextMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const handleRightClick = (e) => {
    e.preventDefault();
    setClickPosition({ x: e.clientX, y: e.clientY });
    setMenuVisible(true);
  };

  const handleClick = ({ key }) => {
    message.info(`Clicked on ${key}`);
    setMenuVisible(false);
  };

  const menu = (
    <Menu onClick={handleClick}>
      <Menu.Item key="edit">Edit</Menu.Item>
      <Menu.Item key="delete">Delete</Menu.Item>
    </Menu>
  );

  return (
    <div
      onContextMenu={handleRightClick}
      style={{
        width: 300,
        height: 200,
        border: '1px solid #ccc',
        lineHeight: '200px',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      Right-click on this box
      {menuVisible && (
        <div
          style={{
            position: 'fixed',
            left: clickPosition.x,
            top: clickPosition.y,
            zIndex: 1000,
          }}
          onClick={() => setMenuVisible(false)}
        >
          <Dropdown overlay={menu} open>
            <span />
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
