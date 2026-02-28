import {PiHouseLine} from 'react-icons/pi';
import { FaRegUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import React from 'react';

//Column
export const  leftSideBarData = [
  {
    title: "Home",
    icon: <PiHouseLine />,
    link: "/home"
  },
  {
    title: "My Events",
    icon: <FaRegUser />,
    link: "/profile"
  },
  {
    title: "Logout",
    icon: <MdLogout />,
    link: "logout"
  }
]