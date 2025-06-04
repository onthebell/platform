'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { CommunityPost } from '@/types';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { formatDate } from '@/lib/utils';

interface JobDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: CommunityPost | null;
}

const jobTypeColors: { [key: string]: string } = {
  full_time: 'bg-blue-50 text-blue-700 border-blue-200',
  part_time: 'bg-green-50 text-green-700 border-green-200',
  one_off: 'bg-purple-50 text-purple-700 border-purple-200',
  contract: 'bg-orange-50 text-orange-700 border-orange-200',
  volunteer: 'bg-pink-50 text-pink-700 border-pink-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
};

const jobTypeLabels: { [key: string]: string } = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  one_off: 'One-off',
  contract: 'Contract',
  volunteer: 'Volunteer',
};

const workTypeLabels: { [key: string]: string } = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

const employerTypeLabels: { [key: string]: string } = {
  business: 'Business',
  person: 'Individual',
};

export default function JobDetailDrawer({ isOpen, onClose, job }: JobDetailDrawerProps) {
  const { savedJobs, toggleSaveJob } = useSavedJobs();

  if (!job) return null;

  const isJobSaved = savedJobs.some(savedJob => savedJob.postId === job.id);
  const jobTypeColor = jobTypeColors[job.jobType || 'default'] || jobTypeColors.default;
  const jobTypeLabel = jobTypeLabels[job.jobType || ''] || job.jobType;

  const handleSaveJob = async () => {
    if (!job) return;
    try {
      await toggleSaveJob(job.id, job.title, job.category);
    } catch (error) {
      console.error('Error toggling job save:', error);
    }
  };

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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity" />
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
                    <div className="bg-blue-50 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                          <div>
                            <Dialog.Title className="text-lg font-medium text-gray-900">
                              {job.title}
                            </Dialog.Title>
                            <span
                              className={`inline-block mt-1 px-2 py-1 text-xs font-medium border rounded-full ${jobTypeColor}`}
                            >
                              {jobTypeLabel}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex h-7 items-center space-x-2">
                          <button
                            onClick={handleSaveJob}
                            className="rounded-md p-1 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            title={isJobSaved ? 'Remove from saved jobs' : 'Save job'}
                          >
                            {isJobSaved ? (
                              <BookmarkIconSolid className="h-5 w-5" />
                            ) : (
                              <BookmarkIcon className="h-5 w-5" />
                            )}
                          </button>
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
                        {job.description && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {job.description}
                            </div>
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-4">
                          {job.startDate && (
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Start Date</p>
                                <p className="text-sm text-gray-600">{formatDate(job.startDate)}</p>
                              </div>
                            </div>
                          )}

                          {job.workType && (
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Work Type</p>
                                <p className="text-sm text-gray-600">
                                  {workTypeLabels[job.workType] || job.workType}
                                </p>
                              </div>
                            </div>
                          )}

                          {job.industry && (
                            <div className="flex items-center space-x-3">
                              <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Industry</p>
                                <p className="text-sm text-gray-600">{job.industry}</p>
                              </div>
                            </div>
                          )}

                          {job.employerType && (
                            <div className="flex items-center space-x-3">
                              {job.employerType === 'business' ? (
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                              ) : (
                                <UserIcon className="h-5 w-5 text-gray-400" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">Employer</p>
                                <p className="text-sm text-gray-600">
                                  {employerTypeLabels[job.employerType] || job.employerType}
                                </p>
                              </div>
                            </div>
                          )}

                          {job.location && (
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Location</p>
                                <p className="text-sm text-gray-600">{job.location.address}</p>
                              </div>
                            </div>
                          )}

                          {/* Posted date */}
                          <div className="flex items-center space-x-3">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Posted</p>
                              <p className="text-sm text-gray-600">{formatDate(job.createdAt)}</p>
                            </div>
                          </div>

                          {/* Author */}
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Posted by</p>
                              <p className="text-sm text-gray-600">{job.authorName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact section */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-900 mb-2">
                            Interested in this job?
                          </h3>
                          <p className="text-sm text-blue-700 mb-3">
                            Contact {job.authorName} directly to apply or ask questions.
                          </p>
                          <button
                            onClick={() => {
                              // You can implement a contact form modal or messaging system here
                              alert(
                                `Contact feature coming soon! For now, look for contact details in the job description or post a comment on the main job listing.`
                              );
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Contact Employer
                          </button>
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
                          <BriefcaseIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Dialog.Title className="text-lg font-medium text-gray-900 truncate">
                              {job.title}
                            </Dialog.Title>
                            <span
                              className={`inline-block mt-1 px-2 py-1 text-xs font-medium border rounded-full ${jobTypeColor}`}
                            >
                              {jobTypeLabel}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={handleSaveJob}
                            className="rounded-md p-1 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title={isJobSaved ? 'Remove from saved jobs' : 'Save job'}
                          >
                            {isJobSaved ? (
                              <BookmarkIconSolid className="h-5 w-5" />
                            ) : (
                              <BookmarkIcon className="h-5 w-5" />
                            )}
                          </button>
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
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto">
                      <div className="space-y-4">
                        {/* Description */}
                        {job.description && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {job.description}
                            </div>
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-3">
                          {job.startDate && (
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Start Date</p>
                                <p className="text-sm text-gray-600">{formatDate(job.startDate)}</p>
                              </div>
                            </div>
                          )}

                          {job.workType && (
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Work Type</p>
                                <p className="text-sm text-gray-600">
                                  {workTypeLabels[job.workType] || job.workType}
                                </p>
                              </div>
                            </div>
                          )}

                          {job.industry && (
                            <div className="flex items-center space-x-3">
                              <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Industry</p>
                                <p className="text-sm text-gray-600">{job.industry}</p>
                              </div>
                            </div>
                          )}

                          {job.employerType && (
                            <div className="flex items-center space-x-3">
                              {job.employerType === 'business' ? (
                                <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">Employer</p>
                                <p className="text-sm text-gray-600">
                                  {employerTypeLabels[job.employerType] || job.employerType}
                                </p>
                              </div>
                            </div>
                          )}

                          {job.location && (
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Location</p>
                                <p className="text-sm text-gray-600">{job.location.address}</p>
                              </div>
                            </div>
                          )}

                          {/* Posted date */}
                          <div className="flex items-center space-x-3">
                            <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Posted</p>
                              <p className="text-sm text-gray-600">{formatDate(job.createdAt)}</p>
                            </div>
                          </div>

                          {/* Author */}
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Posted by</p>
                              <p className="text-sm text-gray-600">{job.authorName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact section */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-blue-900 mb-2">
                            Interested in this job?
                          </h3>
                          <p className="text-sm text-blue-700 mb-3">
                            Contact {job.authorName} directly to apply or ask questions.
                          </p>
                          <button
                            onClick={() => {
                              // You can implement a contact form modal or messaging system here
                              alert(
                                `Contact feature coming soon! For now, look for contact details in the job description or post a comment on the main job listing.`
                              );
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Contact Employer
                          </button>
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
