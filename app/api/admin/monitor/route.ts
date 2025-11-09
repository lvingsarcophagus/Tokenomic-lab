/**
 * Admin API Monitoring Endpoint
 * GET /api/admin/monitor
 * 
 * Returns real-time API usage statistics for all services
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAPIStats, resetAPIStats } from '@/lib/api-monitor';
import { getCacheStats, clearCache, getCachedTokensList } from '@/lib/behavioral-cache';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const user = await auth.getUser(decodedToken.uid);
      
      // Check if user has admin custom claim
      if (!user.customClaims?.admin) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get API statistics
    const apiStats = getAPIStats();
    
    // Get cache statistics
    const cacheStats = getCacheStats();
    
    // Get cached tokens list
    const cachedTokens = getCachedTokensList();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      api: {
        services: Array.isArray(apiStats) ? apiStats : [apiStats],
        summary: {
          totalRequests: Array.isArray(apiStats) 
            ? apiStats.reduce((sum, stat) => sum + stat.totalRequests, 0)
            : apiStats.totalRequests,
          totalFailures: Array.isArray(apiStats)
            ? apiStats.reduce((sum, stat) => sum + stat.failedRequests, 0)
            : apiStats.failedRequests,
          healthyServices: Array.isArray(apiStats)
            ? apiStats.filter(stat => stat.health === 'healthy').length
            : (apiStats.health === 'healthy' ? 1 : 0),
          criticalServices: Array.isArray(apiStats)
            ? apiStats.filter(stat => stat.health === 'critical' || stat.health === 'offline').length
            : (['critical', 'offline'].includes(apiStats.health) ? 1 : 0)
        }
      },
      cache: {
        stats: cacheStats,
        tokens: {
          count: cachedTokens.length,
          list: cachedTokens.slice(0, 10) // Return first 10 for preview
        }
      }
    });
  } catch (error: any) {
    console.error('[Admin Monitor] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const user = await auth.getUser(decodedToken.uid);
      
      if (!user.customClaims?.admin) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse action from request body
    const body = await request.json();
    const { action } = body;

    if (action === 'reset_api_stats') {
      resetAPIStats();
      return NextResponse.json({
        success: true,
        message: 'API statistics reset successfully'
      });
    }

    if (action === 'clear_cache') {
      clearCache();
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Admin Monitor] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
