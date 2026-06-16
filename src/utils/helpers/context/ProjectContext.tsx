// import { APIGetBranding } from "@/api/branding";
// import CommonLoader from "@/components/common/CommonLoader";
// import { createContext, useContext, useEffect, useState } from "react";

// export const ProjectContext = createContext<any>(null);

// export const ProjectProvider = ({ children }: any) => {
//   const [branding, setBranding] = useState<any>(null);
//   const [brandLoading, setBrandLoading] = useState(true);

//   useEffect(() => {
//     async function loadBranding() {
//       try {
//         const res = await APIGetBranding();
//         setBranding(res?.data || null);
//       } catch (e) {
//         console.error("Failed to load branding", e);
//       } finally {
//         setBrandLoading(false);
//       }
//     }
//     loadBranding();
//   }, []);

//   return (
//     <ProjectContext.Provider value={{ branding, brandLoading }}>
//       {brandLoading ? <CommonLoader type="branding" /> : children}
//     </ProjectContext.Provider>
//   );
// };

// export const useProject = () => useContext(ProjectContext);
