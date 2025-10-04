'use client'
import React, { useEffect, useState } from 'react'
import { SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarSeparator, Sidebar } from './ui/sidebar'
import { Telescope } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { useRouter } from 'next/navigation'

export default function AppSidebar() {
    const [meteors, setMeteors] = useState([])
    const router=useRouter()
    useEffect(() => {
        getChats()
    }, [])

    const getChats = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/neos')
            const data = await res.json()
            setMeteors(data)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="h-screen"> 
            <Sidebar className="flex flex-col h-full mt-0">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <h2 className="text-2xl font-bold mb-1 text-center">NEOs</h2>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarSeparator />
                <ScrollArea className="flex-1 h-full">
                    <SidebarContent className="flex flex-col gap-1 p-2">
                        <SidebarMenu>
                            {meteors.map((meteor) => (
                                <SidebarMenuItem key={meteor.id}>
                                    <div className="flex items-center gap-2 p-2 rounded cursor-pointer" onClick={()=>router.push(`/neo/meteor/${meteor.id}`)}>
                                        <Telescope size={16} />
                                        <span>{meteor.name}</span>
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                </ScrollArea>
            </Sidebar>
        </div>
    )
}
