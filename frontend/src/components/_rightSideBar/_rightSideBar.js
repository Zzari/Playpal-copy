import React, { useState } from 'react';
import { FaChevronUp , FaChevronDown } from "react-icons/fa";
import { MdNotificationAdd } from "react-icons/md";
import "./_rightSideBar.css";
function RightSideBar({ notifications = [], onNotificationsOpen }) {
  const [Notifopen, setNotifOpen] = useState(false);
  return (
    <div className="right-sidebar">
      <ul className="right-sidebar-list">
           <li className="notif">
                 <div 
                  className={`notif-header${Notifopen ? " active" : ""}`}
                  onClick={async () => {
                    const isOpening = !Notifopen;
                    setNotifOpen(isOpening);
                    
                    if (isOpening) {
                      onNotificationsOpen();
                    }
                  }}
                 >
                   <div className="notif-logo">
                     <MdNotificationAdd/>
                   </div>
                   <div className="notif-title" >
                     Notifications
                   </div>
                   <div className ="notif-icon">
                     {Notifopen ? <FaChevronDown/> : <FaChevronUp/>}
                   </div>
                 </div>
                 {Notifopen && (
                 <ul className="notif-list">
                   {notifications.length > 0 ? (
                     notifications.map(notification => (
                       <li key={notification.id}>
                         <div className="notification-message">{notification.message}</div>
                       </li>
                     ))
                   ) : (
                     <li>
                       <div className="notification-message">No new notifications</div>
                     </li>
                   )}
                 </ul>
                 )}
            </li>
      </ul>
    </div>
  )
}

export default RightSideBar;