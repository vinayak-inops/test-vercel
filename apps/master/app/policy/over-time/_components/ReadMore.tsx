import React from 'react';
import { OTPolicyApplication } from './types';
import { FiX, FiInfo, FiClock, FiSettings, FiCheck } from 'react-icons/fi';

interface ReadMoreProps {
  item: OTPolicyApplication;
  onClose: () => void;
}

export default function ReadMore({ item, onClose }: ReadMoreProps) {
  return (
    <div className="p-6 w-full h-full overflow-y-auto" style={{ width: '1100px', maxWidth: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-[16px] font-bold leading-tight">Overtime Policy Details</span>
          <span className="text-[14px] text-gray-600">Detailed view of the overtime policy.</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {/* Basic Information */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiInfo className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Organization Code:</span>
              <span className="font-medium text-gray-900 ml-2">{item.organizationCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Tenant Code:</span>
              <span className="font-medium text-gray-900 ml-2">{item.tenantCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Subsidiary:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.subsidiary.subsidiaryName} ({item.subsidiary.subsidiaryCode})
              </span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.location.locationName} ({item.location.locationCode})
              </span>
            </div>
            <div>
              <span className="text-gray-500">Employee Categories:</span>
              <span className="flex flex-wrap gap-2 ml-2">
                {item.employeeCategory.map(cat => (
                  <span key={cat} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f0ff] text-[#0061ff] border border-[#b3d1ff]">{cat}</span>
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiSettings className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">Policy Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Policy Code:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.otPolicyCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Policy Name:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.otPolicyName}</span>
            </div>
            <div>
              <span className="text-gray-500">Calculation Basis:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.otPolicy.calculateOnTheBasisOf.calculationBasis}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.otPolicy.status === 'active'
                      ? 'bg-[#e6f0ff] text-[#0061ff]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      item.otPolicy.status === 'active'
                        ? 'bg-[#0061ff]'
                        : 'bg-red-500'
                    }`}
                  />
                  {item.otPolicy.status}
                </span>
              </span>
            </div>
            <div>
              <span className="text-gray-500">Yearly Maximum Hours:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.yearlyMaximumAllowedHours}</span>
            </div>
            <div>
              <span className="text-gray-500">Considered For Working Day:</span>
              <span className="ml-2">{item.otPolicy.isConsideredForWorkingDay ? <FiCheck className="inline text-green-500" /> : <FiX className="inline text-gray-400" />} {item.otPolicy.isConsideredForWorkingDay ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Multipliers and Limits */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">Multipliers and Limits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Working Day Multiplier:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.multiplierForWorkingDay}x</span>
            </div>
            <div>
              <span className="text-gray-500">National Holiday Multiplier:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.multiplierForNationalHoliday}x</span>
            </div>
            <div>
              <span className="text-gray-500">Holiday Multiplier:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.multiplierForHoliday}x</span>
            </div>
            <div>
              <span className="text-gray-500">Weekly Off Multiplier:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.multiplierForWeeklyOff}x</span>
            </div>
            <div>
              <span className="text-gray-500">Daily Maximum Hours:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.dailyMaximumAllowedHours}</span>
            </div>
            <div>
              <span className="text-gray-500">Weekly Maximum Hours:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.weeklyMaximumAllowedHours}</span>
            </div>
            <div>
              <span className="text-gray-500">Monthly Maximum Hours:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.monthlyMaximumAllowedHours}</span>
            </div>
            <div>
              <span className="text-gray-500">Quarterly Maximum Hours:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.quaterlyMaximumAllowedHours}</span>
            </div>
            <div>
              <span className="text-gray-500">Maximum Hours On Holiday:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.maximumHoursOnHoliday}</span>
            </div>
            <div>
              <span className="text-gray-500">Maximum Hours On Weekend:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.maximumHoursOnWeekend}</span>
            </div>
            <div>
              <span className="text-gray-500">Maximum Hours On Weekday:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.maximumHoursOnWeekday}</span>
            </div>
            <div>
              <span className="text-gray-500">Yearly Maximum Hours:</span>
              <span className="font-medium text-gray-900 ml-2">{item.otPolicy.yearlyMaximumAllowedHours}</span>
            </div>
            <div>
              <span className="text-gray-500">Considered Before Shift:</span>
              <span className="ml-2">{item.otPolicy.isConsideredBeforeShift ? <FiCheck className="inline text-green-500" /> : <FiX className="inline text-gray-400" />} {item.otPolicy.isConsideredBeforeShift ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Considered After Shift:</span>
              <span className="ml-2">{item.otPolicy.isConsideredAfterShift ? <FiCheck className="inline text-green-500" /> : <FiX className="inline text-gray-400" />} {item.otPolicy.isConsideredAfterShift ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Rounding Rules */}
        {item.otPolicy.rounding.length > 0 && (
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <FiSettings className="text-[#0061ff]" size={20} />
              <h3 className="text-[14px] font-semibold text-gray-700">Rounding Rules</h3>
            </div>
            <div className="space-y-2">
              {item.otPolicy.rounding.map((rule, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm">
                    {rule.from} - {rule.to} minutes
                  </span>
                  <span className="text-sm font-medium text-[#0061ff]">
                    → Round to {rule.roundOffTo} minutes
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Settings */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiSettings className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">Additional Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Minimum Extra Minutes for OT:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.otPolicy.minimumExtraMinutesConsideredForOT} minutes
              </span>
            </div>
            <div>
              <span className="text-gray-500">Minimum Fixed Minutes for OT:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.otPolicy.minimumFixedMinutesToAllowOvertime} minutes
              </span>
            </div>
            <div>
              <span className="text-gray-500">Approval Required:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.otPolicy.approvalRequired ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Action on Limit Crossed:</span>
              <span className="font-medium text-gray-900 ml-2">
                {item.otPolicy.doThisWhenCrossedAllocatedLimit}
              </span>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {item.otPolicy.remark && (
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <FiInfo className="text-[#0061ff]" size={20} />
              <h3 className="text-[14px] font-semibold text-gray-700">Remarks</h3>
            </div>
            <p className="text-gray-700">{item.otPolicy.remark}</p>
          </div>
        )}
      </div>
    </div>
  );
} 