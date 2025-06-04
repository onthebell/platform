'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommunityPost, Business, Event } from '@/types';
import { getPosts, getBusinesses, getEvents } from '@/lib/firebase/firestore';
import { bellarineSuburbs } from '@/components/map/bellarineSuburbs';
import { useAuth } from '@/lib/firebase/auth';

export interface MapDataPoint {
  id: string;
  position: [number, number]; // [lat, lng]
  title: string;
  description: string;
  category:
    | 'events'
    | 'deals'
    | 'marketplace'
    | 'free_items'
    | 'help_requests'
    | 'food'
    | 'businesses';
  type: 'post' | 'business' | 'event';
  date?: string;
  time?: string;
  address?: string;
  contact?: string;
  originalData: CommunityPost | Business | Event;
}

export interface SuburbData {
  name: string;
  center: [number, number]; // [lat, lng]
  count: number;
  categories: {
    events: number;
    deals: number;
    marketplace: number;
    free_items: number;
    help_requests: number;
    food: number;
    businesses: number;
  };
}

interface UseFirestoreMapDataOptions {
  includeCategories?: string[];
  excludeCategories?: string[];
  refreshInterval?: number; // in milliseconds
}

export function useFirestoreMapData(options: UseFirestoreMapDataOptions = {}) {
  console.log('🔧 useFirestoreMapData hook initialized with options:', options);

  // All state hooks first
  const [dataPoints, setDataPoints] = useState<MapDataPoint[]>([]);
  const [suburbData, setSuburbData] = useState<SuburbData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  console.log('🔧 Hook state:', { mounted, loading, dataPoints: dataPoints.length });

  // Test useEffect hooks immediately after state
  useEffect(() => {
    console.log('🎯 SIMPLE TEST useEffect is definitely running!');
    console.log('🎯 Testing if useEffect works at all');
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('🎯 SECOND TEST useEffect running, mounted:', mounted);
  }, [mounted]);

  // Calculate center point of a polygon
  const calculatePolygonCenter = useCallback((coordinates: number[][][]): [number, number] => {
    let latSum = 0;
    let lngSum = 0;
    let pointCount = 0;

    coordinates[0].forEach(coord => {
      lngSum += coord[0];
      latSum += coord[1];
      pointCount++;
    });

    return [latSum / pointCount, lngSum / pointCount];
  }, []);

  // Check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = useCallback((point: [number, number], polygon: number[][]): boolean => {
    const [lat, lng] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      if (yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }, []);

  // Find which suburb a point belongs to
  const findSuburbForPoint = useCallback(
    (point: [number, number]): string | null => {
      for (const feature of bellarineSuburbs.features) {
        if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
          const polygon = feature.geometry.coordinates[0];
          if (isPointInPolygon(point, polygon)) {
            return feature.properties.name;
          }
        }
      }
      return null;
    },
    [isPointInPolygon]
  );

  // Convert post to map data point
  const postToMapDataPoint = useCallback((post: CommunityPost): MapDataPoint | null => {
    if (!post.location?.lat || !post.location?.lng) return null;

    const categoryMap: { [key: string]: MapDataPoint['category'] } = {
      events: 'events',
      deals: 'deals',
      marketplace: 'marketplace',
      free_items: 'free_items',
      help_requests: 'help_requests',
      food: 'food',
      services: 'food', // Map services to food for now
      community: 'help_requests', // Map community to help_requests
    };

    return {
      id: post.id,
      position: [post.location.lat, post.location.lng],
      title: post.title,
      description: post.description,
      category: categoryMap[post.category] || 'help_requests',
      type: 'post',
      date: post.createdAt.toLocaleDateString(),
      address: post.location.address,
      originalData: post,
    };
  }, []);

  // Convert business to map data point
  const businessToMapDataPoint = useCallback((business: Business): MapDataPoint | null => {
    if (!business.coordinates?.lat || !business.coordinates?.lng) return null;

    return {
      id: business.id,
      position: [business.coordinates.lat, business.coordinates.lng],
      title: business.name,
      description: business.description,
      category: 'businesses',
      type: 'business',
      address: business.address,
      contact: business.contact.phone || business.contact.email,
      originalData: business,
    };
  }, []);

  // Convert event to map data point
  const eventToMapDataPoint = useCallback((event: Event): MapDataPoint | null => {
    if (!event.location?.coordinates?.lat || !event.location?.coordinates?.lng) return null;

    return {
      id: event.id,
      position: [event.location.coordinates.lat, event.location.coordinates.lng],
      title: event.title,
      description: event.description,
      category: 'events',
      type: 'event',
      date: event.startDate.toLocaleDateString(),
      time: event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      address: event.location.address,
      contact: event.organizer,
      originalData: event,
    };
  }, []);

  // Group data points by suburb
  const groupDataBySuburb = useCallback(
    (points: MapDataPoint[]): SuburbData[] => {
      const suburbMap = new Map<string, SuburbData>();

      // Initialize suburbs from GeoJSON
      bellarineSuburbs.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
          const center = calculatePolygonCenter(feature.geometry.coordinates);
          suburbMap.set(feature.properties.name, {
            name: feature.properties.name,
            center,
            count: 0,
            categories: {
              events: 0,
              deals: 0,
              marketplace: 0,
              free_items: 0,
              help_requests: 0,
              food: 0,
              businesses: 0,
            },
          });
        }
      });

      // Assign data points to suburbs
      points.forEach(point => {
        const suburbName = findSuburbForPoint(point.position);
        if (suburbName && suburbMap.has(suburbName)) {
          const suburb = suburbMap.get(suburbName)!;
          suburb.count++;
          suburb.categories[point.category]++;
        }
      });

      return Array.from(suburbMap.values()).filter(suburb => suburb.count > 0);
    },
    [calculatePolygonCenter, findSuburbForPoint]
  );

  // Fetch data from Firestore
  const fetchData = useCallback(async () => {
    console.log('🚀 fetchData function called!');
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting map data fetch...');

      const [posts, businesses, events] = await Promise.all([
        getPosts({ status: 'active' }, 100), // Get more posts for better coverage
        getBusinesses({}, 50),
        getEvents({ status: 'active' }, 50),
      ]);

      console.log('📊 Fetched data:', {
        posts: posts.length,
        businesses: businesses.length,
        events: events.length,
      });

      console.log(
        '📝 First few posts:',
        posts.slice(0, 3).map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          location: p.location,
        }))
      );

      let filteredPosts = posts;
      if (!user || !user.isVerified) {
        filteredPosts = posts.filter(post => post.visibility !== 'verified_only');
      }

      const allDataPoints: MapDataPoint[] = [];

      // Process posts
      filteredPosts.forEach(post => {
        const dataPoint = postToMapDataPoint(post);
        console.log(`📍 Processing post "${post.title}":`, {
          hasLocation: !!post.location,
          dataPoint: dataPoint
            ? {
                id: dataPoint.id,
                title: dataPoint.title,
                category: dataPoint.category,
                position: dataPoint.position,
              }
            : null,
        });

        if (
          dataPoint &&
          (!options.includeCategories || options.includeCategories.includes(dataPoint.category))
        ) {
          if (
            !options.excludeCategories ||
            !options.excludeCategories.includes(dataPoint.category)
          ) {
            allDataPoints.push(dataPoint);
          }
        }
      });

      // Process businesses
      if (!options.excludeCategories || !options.excludeCategories.includes('businesses')) {
        if (!options.includeCategories || options.includeCategories.includes('businesses')) {
          businesses.forEach(business => {
            const dataPoint = businessToMapDataPoint(business);
            if (dataPoint) {
              allDataPoints.push(dataPoint);
            }
          });
        }
      }

      // Process events
      if (!options.excludeCategories || !options.excludeCategories.includes('events')) {
        if (!options.includeCategories || options.includeCategories.includes('events')) {
          events.forEach(event => {
            const dataPoint = eventToMapDataPoint(event);
            if (dataPoint) {
              allDataPoints.push(dataPoint);
            }
          });
        }
      }

      console.log('✅ Final data points:', allDataPoints.length);
      console.log('🏘️ Grouping by suburbs...');

      const suburbDataResult = groupDataBySuburb(allDataPoints);
      console.log('🏘️ Suburb data result:', suburbDataResult.length, suburbDataResult);

      setDataPoints(allDataPoints);
      setSuburbData(suburbDataResult);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('❌ Error fetching map data:', err);
      setError('Failed to load map data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    options.includeCategories,
    options.excludeCategories,
    postToMapDataPoint,
    businessToMapDataPoint,
    eventToMapDataPoint,
    groupDataBySuburb,
    user,
  ]);

  // Initial mount effect
  useEffect(() => {
    console.log('🎯 Mount useEffect is running - starting data fetch immediately');

    const initializeData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Starting map data fetch...');

        const [posts, businesses, events] = await Promise.all([
          getPosts({ status: 'active' }, 100),
          getBusinesses({}, 50),
          getEvents({ status: 'active' }, 50),
        ]);

        console.log('📊 Fetched data:', {
          posts: posts.length,
          businesses: businesses.length,
          events: events.length,
        });

        let filteredPosts = posts;
        if (!user || !user.isVerified) {
          filteredPosts = posts.filter(post => post.visibility !== 'verified_only');
        }

        const allDataPoints: MapDataPoint[] = [];

        // Process posts
        filteredPosts.forEach(post => {
          const dataPoint = postToMapDataPoint(post);
          if (dataPoint) {
            allDataPoints.push(dataPoint);
          }
        });

        // Process businesses
        businesses.forEach(business => {
          const dataPoint = businessToMapDataPoint(business);
          if (dataPoint) {
            allDataPoints.push(dataPoint);
          }
        });

        // Process events
        events.forEach(event => {
          const dataPoint = eventToMapDataPoint(event);
          if (dataPoint) {
            allDataPoints.push(dataPoint);
          }
        });

        console.log('✅ Final data points:', allDataPoints.length);
        console.log('🏘️ Grouping by suburbs...');

        const suburbDataResult = groupDataBySuburb(allDataPoints);
        console.log('🏘️ Suburb data result:', suburbDataResult.length, suburbDataResult);

        setDataPoints(allDataPoints);
        setSuburbData(suburbDataResult);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('❌ Error fetching initial map data:', err);
        setError('Failed to load map data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [groupDataBySuburb, postToMapDataPoint, businessToMapDataPoint, eventToMapDataPoint, user]);

  // Refresh data at specified interval
  useEffect(() => {
    if (options.refreshInterval && !loading) {
      const intervalId = setInterval(() => {
        console.log('⏰ Refresh interval elapsed, refetching data...');
        fetchData();
      }, options.refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [options.refreshInterval, loading, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    dataPoints,
    suburbData,
    loading,
    error,
    lastRefresh,
    refresh,
    totalCount: dataPoints.length, // Add totalCount for consumers
  };
}

export default useFirestoreMapData;
