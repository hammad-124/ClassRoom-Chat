"use client";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../app/redux/store";

const ClientLayout = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ClientLayout;
