'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

interface MarkerData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  address?: string;
  contact?: string;
  position: [number, number];
}

interface MarkerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  markerData: MarkerData | null;
}

const categoryIcons: { [key: string]: string } = {
  events: '🎉',
  deals: '💰',
  marketplace: '🛍️',
  free_items: '🆓',
  help_requests: '🤝',
  food: '🍽️',
  businesses: '🏢',
};

const categoryColors: { [key: string]: string } = {
  events: 'bg-red-50 text-red-700 border-red-200',
  deals: 'bg-green-50 text-green-700 border-green-200',
  marketplace: 'bg-blue-50 text-blue-700 border-blue-200',
  free_items: 'bg-purple-50 text-purple-700 border-purple-200',
  help_requests: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  food: 'bg-pink-50 text-pink-700 border-pink-200',
  businesses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function MarkerDrawer({ isOpen, onClose, markerData }: MarkerDrawerProps) {
  if (!markerData) return null;

  const categoryColor = categoryColors[markerData.category || 'default'] || categoryColors.default;
  const categoryIcon = categoryIcons[markerData.category || 'default'] || '📍';

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed bg-gray-500 bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Desktop - Right drawer */}
            <div className="hidden md:flex pointer-events-none fixed inset-y-0 right-0 max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{categoryIcon}</span>
                          <div>
                            <Dialog.Title className="text-lg font-medium text-gray-900">
                              {markerData.title}
                            </Dialog.Title>
                            {markerData.category && (
                              <span
                                className={`inline-block mt-1 px-2 py-1 text-xs font-medium border rounded-full ${categoryColor}`}
                              >
                                {markerData.category.charAt(0).toUpperCase() +
                                  markerData.category.slice(1).replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 px-4 py-6 sm:px-6">
                      <div className="space-y-6">
                        {/* Description */}
                        {markerData.description && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {markerData.description}
                            </p>
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-4">
                          {markerData.date && (
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Date</p>
                                <p className="text-sm text-gray-600">{markerData.date}</p>
                              </div>
                            </div>
                          )}

                          {markerData.time && (
                            <div className="flex items-center space-x-3">
                              <ClockIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Time</p>
                                <p className="text-sm text-gray-600">{markerData.time}</p>
                              </div>
                            </div>
                          )}

                          {markerData.address && (
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Address</p>
                                <p className="text-sm text-gray-600">{markerData.address}</p>
                              </div>
                            </div>
                          )}

                          {markerData.contact && (
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Contact</p>
                                <p className="text-sm text-gray-600">{markerData.contact}</p>
                              </div>
                            </div>
                          )}

                          {/* Location coordinates for debugging */}
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Location</p>
                              <p className="text-sm text-gray-500">
                                {markerData.position[0].toFixed(4)},{' '}
                                {markerData.position[1].toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>

            {/* Mobile/Tablet - Bottom drawer */}
            <div className="md:hidden pointer-events-none fixed inset-x-0 bottom-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-full">
                  <div className="flex flex-col bg-white shadow-xl rounded-t-xl max-h-[80vh] overflow-hidden">
                    {/* Handle bar */}
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    {/* Header */}
                    <div className="px-4 py-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-2xl">{categoryIcon}</span>
                          <div className="flex-1 min-w-0">
                            <Dialog.Title className="text-lg font-medium text-gray-900 truncate">
                              {markerData.title}
                            </Dialog.Title>
                            {markerData.category && (
                              <span
                                className={`inline-block mt-1 px-2 py-1 text-xs font-medium border rounded-full ${categoryColor}`}
                              >
                                {markerData.category.charAt(0).toUpperCase() +
                                  markerData.category.slice(1).replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ml-3 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto">
                      <div className="space-y-4">
                        {/* Description */}
                        {markerData.description && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {markerData.description}
                            </p>
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-3">
                          {markerData.date && (
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Date</p>
                                <p className="text-sm text-gray-600">{markerData.date}</p>
                              </div>
                            </div>
                          )}

                          {markerData.time && (
                            <div className="flex items-center space-x-3">
                              <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Time</p>
                                <p className="text-sm text-gray-600">{markerData.time}</p>
                              </div>
                            </div>
                          )}

                          {markerData.address && (
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Address</p>
                                <p className="text-sm text-gray-600">{markerData.address}</p>
                              </div>
                            </div>
                          )}

                          {markerData.contact && (
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Contact</p>
                                <p className="text-sm text-gray-600">{markerData.contact}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
