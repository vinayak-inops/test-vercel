"use client";
import React, { Suspense, useEffect } from 'react'
import TabControler from './tab-controler'
import { useParams } from "next/navigation";
import { navorganization } from '@/json/organization/menu';

function PageRoute() {
  const params = useParams()
  const [dynamicFormName, setDynamicFormName] = React.useState<any>("")

  useEffect(() => {
    navorganization.forEach((navs) => {
      navs.items.forEach((nav:any) => {
        console.log("nav.href",nav.href)
       if(nav.href==`/organization/${params.organization[0]}`){
        fetchWidgetConfig(nav?.id);
        }
      });
    });
  }, []);

  const fetchWidgetConfig = async (id:any) => {
      try {
        const response = await fetch(
          `http://49.206.252.89:8080/api/query/attendance/widget_configuration/${id}`,
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        setDynamicFormName(data)
        // setFormData(data);
      } catch (error) {
        console.error("Error fetching widget config:", error);
      }
    };
  
    
  

  return (
    <Suspense fallback={<div className="p-4">Loading location data...</div>}>
      <TabControler pagename={params.organization[0]} dynamicFormName={dynamicFormName}/>
    </Suspense>
  )
}

export default PageRoute