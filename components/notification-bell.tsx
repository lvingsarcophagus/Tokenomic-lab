'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Bell, X } from 'lucide-react'
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    // Listen to notifications in real-time (using subcollection structure)
    const notificationsRef = collection(db, 'alerts', user.uid, 'notifications')
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification))

      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    })

    return () => unsubscribe()
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifs.map(n => 
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white/60 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-black border-2 border-white/20 shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="border-b border-white/20 p-4 flex items-center justify-between">
              <h3 className="text-white font-mono text-sm font-bold tracking-wider uppercase">
                NOTIFICATIONS
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-white/60 hover:text-white font-mono uppercase"
                >
                  MARK ALL READ
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/40 font-mono text-xs">
                NO NOTIFICATIONS
              </div>
            ) : (
              <div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`border-b border-white/10 p-4 hover:bg-white/5 transition-colors ${
                      !notif.read ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className={`font-mono text-sm ${!notif.read ? 'text-white font-bold' : 'text-white/80'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-white/60 font-mono text-xs mb-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-white/40 font-mono text-[10px]">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
