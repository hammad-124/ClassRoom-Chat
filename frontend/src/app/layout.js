
import "./globals.css";
import ClientLayout from "./clientLayout";
import Navbar from "./components/navbar";
import Image from "next/image";


export const metadata = {
  title: "ClassRoom-Chat",
  description: "Generated by Hammad",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <ClientLayout>
          <Navbar/>
          <main className="mt-20 px-6 md:px-16">{children}</main>
        </ClientLayout>
      </body>
    </html>
  );
}
