"use client";
import { useEffect, useState, useCallback } from "react";
import { dashboardService, DashboardApi } from "@/services/admin/dashboard.service";

export function useDashboard(){
  const [data, setData] = useState<DashboardApi | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async ()=>{
    setLoading(true);
    try{
      const res:any = await dashboardService.get();
      setData(res.data || res);
    }finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ fetch(); },[fetch]);
  return { data, loading, refresh: fetch };
}