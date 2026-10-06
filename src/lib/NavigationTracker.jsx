import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Post navigation changes to parent window if in an iframe
    useEffect(() => {
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: "app_changed_url",
                    url: window.location.href
                }, '*');
            }
        } catch (_) {}
    }, [location]);

    // Log user activity when navigating to a page
    useEffect(() => {
        try {
            const pathname = location.pathname;
            let pageName;
            
            if (pathname === '/' || pathname === '') {
                pageName = mainPageKey;
            } else {
                const pathSegment = pathname.replace(/^\//, '').split('/')[0];
                const pageKeys = Object.keys(Pages);
                const matchedKey = pageKeys.find(
                    key => key.toLowerCase() === pathSegment.toLowerCase()
                );
                pageName = matchedKey || null;
            }

            if (isAuthenticated && pageName && base44?.appLogs?.logUserInApp) {
                base44.appLogs.logUserInApp(pageName).catch(() => {});
            }
        } catch (_) {}
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}