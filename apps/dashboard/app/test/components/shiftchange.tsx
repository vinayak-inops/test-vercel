"use client";
import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, Space, Typography, Divider, Tag, Progress, Alert, Row, Col } from 'antd/lib';
import type { FormInstance, FormListFieldData } from 'antd/lib/form';
import type { FormItemProps } from 'antd/lib/form';
import type { InputProps } from 'antd/lib/input';
import type { FormProps } from 'antd/lib/form';

const { Title, Text } = Typography;

// Types for shift change
interface ShiftChangeBase {
  empid: string;
  fromdate: string;
  todate: string;
  type: 'Automatic' | 'Fixed' | 'Rotational';
  shiftgroup: string;
}

interface AutomaticShiftChange extends ShiftChangeBase {
  type: 'Automatic';
}

interface FixedShiftChange extends ShiftChangeBase {
  type: 'Fixed';
  shift: string;
}

interface RotationalShiftChange extends ShiftChangeBase {
  type: 'Rotational';
  shifts: Array<{
    shift: string;
    noofdays: number;
  }>;
}

type ShiftChange = AutomaticShiftChange | FixedShiftChange | RotationalShiftChange;

// Sample employee data - replace this with actual data from your backend
const sampleEmployees = [
  { value: 'EMP001', label: 'EMP001 - John Doe' },
  { value: 'EMP002', label: 'EMP002 - Jane Smith' },
  { value: 'EMP003', label: 'EMP003 - Mike Johnson' },
  { value: 'EMP004', label: 'EMP004 - Sarah Williams' },
  { value: 'EMP005', label: 'EMP005 - David Brown' },
];

const ShiftChangeForm: React.FC = () => {
  const [form] = Form.useForm<ShiftChange>();
  const [shiftType, setShiftType] = useState<'Automatic' | 'Fixed' | 'Rotational'>('Automatic');
  const [totalDays, setTotalDays] = useState<number>(0);
  const [allocatedDays, setAllocatedDays] = useState<number>(0);

  const calculateTotalDays = (fromDate: string, toDate: string) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  const onFinish = (values: ShiftChange) => {
    console.log('Form values:', values);
    // Handle form submission here
  };

  const handleTypeChange = (value: 'Automatic' | 'Fixed' | 'Rotational') => {
    setShiftType(value);
    form.resetFields(['shift', 'shifts']);
  };

  const handleDateChange = () => {
    const fromDate = form.getFieldValue('fromdate')?.format('YYYY-MM-DD');
    const toDate = form.getFieldValue('todate')?.format('YYYY-MM-DD');
    
    if (fromDate && toDate) {
      const days = calculateTotalDays(fromDate, toDate);
      setTotalDays(days);
      // Reset allocated days when dates change
      setAllocatedDays(0);
      form.resetFields(['shifts']);
    }
  };

  const updateAllocatedDays = (shifts: any[]) => {
    const total = shifts.reduce((sum: number, shift: any) => {
      return sum + (Number(shift?.noofdays) || 0);
    }, 0);
    setAllocatedDays(total);
  };

  const validateTotalDays = (_: any, value: number) => {
    const shifts = form.getFieldValue('shifts') || [];
    const currentIndex = shifts.findIndex((shift: any) => shift?.noofdays === value);
    const otherShiftsTotal = shifts.reduce((sum: number, shift: any, index: number) => {
      if (index !== currentIndex && shift?.noofdays) {
        return sum + Number(shift.noofdays);
      }
      return sum;
    }, 0);

    const newTotal = otherShiftsTotal + Number(value);

    // Strict validation for exact total at all times
    if (newTotal !== totalDays) {
      return Promise.reject(`Sum must equal exactly ${totalDays} days`);
    }

    // Validate individual shift days
    if (Number(value) > totalDays) {
      return Promise.reject(`Shift days cannot exceed ${totalDays} days`);
    }

    // Update allocated days after validation
    updateAllocatedDays(shifts);
    return Promise.resolve();
  };

  const validateShiftDistribution = () => {
    const shifts = form.getFieldValue('shifts') || [];
    const totalAllocated = shifts.reduce((sum: number, shift: any) => {
      return sum + (Number(shift?.noofdays) || 0);
    }, 0);

    // Strict validation for exact total at all times
    if (totalAllocated !== totalDays) {
      return Promise.reject(`Sum of days (${totalAllocated}) must equal exactly ${totalDays} days`);
    }

    // Validate shift distribution
    const shiftDays = shifts.map((shift: any) => Number(shift?.noofdays) || 0);
    
    // Validate that no single shift exceeds totalDays
    const hasInvalidShift = shiftDays.some((days: number) => days > totalDays);
    if (hasInvalidShift) {
      return Promise.reject(`No single shift can exceed ${totalDays} days`);
    }

    // Validate that all shifts have positive days
    const hasZeroOrNegativeDays = shiftDays.some((days: number) => days <= 0);
    if (hasZeroOrNegativeDays) {
      return Promise.reject('Each shift must have at least 1 day');
    }

    return Promise.resolve();
  };

  const progressPercent = totalDays > 0 ? Math.round((allocatedDays / totalDays) * 100) : 0;
  const progressStatus = progressPercent === 100 ? 'success' : progressPercent > 100 ? 'exception' : 'active';

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '40px',
          color: 'white'
        }}>
          <Title 
            level={1} 
            style={{ 
              color: 'white',
              fontSize: '36px',
              fontWeight: '700',
              margin: '0 0 12px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Shift Change Request
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Configure and manage employee shift schedules
          </Text>
        </div>

        <Card 
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e8f4fd'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Form<ShiftChange>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ type: 'Automatic' }}
          >
            {/* Employee Selection */}
            <div style={{ 
              backgroundColor: '#fafbfc',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e8f0fe',
              marginBottom: '24px'
            }}>
              <Title level={4} style={{ 
                color: '#1f2937', 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Employee Information
              </Title>
              
              <Form.Item<ShiftChange>
                name="empid"
                label={<span style={{ fontWeight: '500', color: '#374151' }}>Employee ID</span>}
                rules={[{ required: true, message: 'Please select Employee ID' }]}
              >
                <Select
                  id="empid"
                  placeholder="Search and select employee..."
                  options={sampleEmployees}
                  showSearch
                  size="large"
                  style={{ borderRadius: '8px' }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </div>

            {/* Date Selection */}
            <div style={{ 
              backgroundColor: '#fafbfc',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e8f0fe',
              marginBottom: '24px'
            }}>
              <Title level={4} style={{ 
                color: '#1f2937', 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Schedule Period
              </Title>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item<ShiftChange>
                    name="fromdate"
                    label={<span style={{ fontWeight: '500', color: '#374151' }}>From Date</span>}
                    rules={[{ required: true, message: 'Please select From Date' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%', borderRadius: '8px' }} 
                      size="large"
                      format="DD-MMM-YYYY" 
                      onChange={handleDateChange}
                      placeholder="Select start date"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item<ShiftChange>
                    name="todate"
                    label={<span style={{ fontWeight: '500', color: '#374151' }}>To Date</span>}
                    rules={[{ required: true, message: 'Please select To Date' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%', borderRadius: '8px' }} 
                      size="large"
                      format="DD-MMM-YYYY" 
                      onChange={handleDateChange}
                      placeholder="Select end date"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {totalDays > 0 && (
                <Alert
                  message={`Total Duration: ${totalDays} days`}
                  type="info"
                  showIcon
                  style={{ 
                    marginTop: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd'
                  }}
                />
              )}
            </div>

            {/* Shift Configuration */}
            <div style={{ 
              backgroundColor: '#fafbfc',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e8f0fe',
              marginBottom: '24px'
            }}>
              <Title level={4} style={{ 
                color: '#1f2937', 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Shift Configuration
              </Title>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item<ShiftChange>
                    name="type"
                    label={<span style={{ fontWeight: '500', color: '#374151' }}>Shift Type</span>}
                    rules={[{ required: true, message: 'Please select Shift Type' }]}
                  >
                    <Select
                      onChange={handleTypeChange}
                      size="large"
                      style={{ borderRadius: '8px' }}
                      placeholder="Select shift type"
                      options={[
                        { value: 'Automatic', label: 'Automatic' },
                        { value: 'Fixed', label: 'Fixed' },
                        { value: 'Rotational', label: 'Rotational' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item<ShiftChange>
                    name="shiftgroup"
                    label={<span style={{ fontWeight: '500', color: '#374151' }}>Shift Group</span>}
                    rules={[{ required: true, message: 'Please enter Shift Group' }]}
                  >
                    <Input 
                      id="shiftgroup" 
                      placeholder="Enter shift group name" 
                      size="large"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Shift Type Indicator */}
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontWeight: '500', color: '#6b7280', marginRight: '12px' }}>
                  Selected Type:
                </Text>
                <Tag 
                  color={shiftType === 'Automatic' ? 'green' : shiftType === 'Fixed' ? 'blue' : 'orange'} 
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {shiftType}
                </Tag>
              </div>

              {shiftType === 'Fixed' && (
                <div style={{ marginTop: '20px' }}>
                  <Form.Item<ShiftChange>
                    name="shift"
                    label={<span style={{ fontWeight: '500', color: '#374151' }}>Shift</span>}
                    rules={[{ required: true, message: 'Please enter Shift' }]}
                  >
                    <Input 
                      id="shift" 
                      placeholder="Enter shift name (e.g., A1, Morning, Night)" 
                      size="large"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </div>
              )}
            </div>

            {/* Rotational Shifts */}
            {shiftType === 'Rotational' && (
              <div style={{ 
                backgroundColor: '#fafbfc',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e8f0fe',
                marginBottom: '24px'
              }}>
                <Title level={4} style={{ 
                  color: '#1f2937', 
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Rotation Schedule
                </Title>

                {totalDays > 0 && (
                  <Card size="small" style={{ 
                    marginBottom: '20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <Text strong style={{ color: '#374151' }}>Day Allocation</Text>
                      <Text style={{ color: '#6b7280' }}>{allocatedDays} / {totalDays} days</Text>
                    </div>
                    <Progress 
                      percent={progressPercent} 
                      status={progressStatus}
                      strokeColor={progressPercent === 100 ? '#10b981' : '#3b82f6'}
                      style={{ marginBottom: '8px' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      All shift days must sum to exactly {totalDays} days
                    </Text>
                  </Card>
                )}

                <Form.List 
                  name="shifts"
                  rules={[
                    { validator: validateShiftDistribution }
                  ]}
                >
                  {(fields: FormListFieldData[], { add, remove }: { add: () => void; remove: (index: number) => void }) => (
                    <>
                      {fields.map(({ key, name, ...restField }: FormListFieldData, index: number) => (
                        <Card 
                          key={key} 
                          size="small"
                          style={{ 
                            marginBottom: '16px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb'
                          }}
                          title={
                            <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                              Shift {index + 1}
                            </span>
                          }
                          extra={
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              onClick={() => {
                                remove(name);
                                const shifts = form.getFieldValue('shifts') || [];
                                updateAllocatedDays(shifts);
                              }}
                            >
                              Remove
                            </Button>
                          }
                        >
                          <Row gutter={16}>
                            <Col xs={24} md={16}>
                              <Form.Item
                                {...restField}
                                name={[name, 'shift']}
                                label="Shift Name"
                                rules={[{ required: true, message: 'Please enter shift name' }]}
                                style={{ marginBottom: '12px' }}
                              >
                                <Input 
                                  id={`shift-${name}`} 
                                  placeholder="e.g., A1, Morning, Night" 
                                  style={{ borderRadius: '6px' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                              <Form.Item
                                {...restField}
                                name={[name, 'noofdays']}
                                label="Number of Days"
                                rules={[
                                  { required: true, message: 'Please enter number of days' },
                                  { validator: validateTotalDays }
                                ]}
                                style={{ marginBottom: '12px' }}
                              >
                                <Input 
                                  id={`days-${name}`} 
                                  type="number" 
                                  min={1}
                                  max={totalDays}
                                  placeholder="Days" 
                                  style={{ borderRadius: '6px' }}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value) {
                                      const shifts = form.getFieldValue('shifts') || [];
                                      shifts[name] = { ...shifts[name], noofdays: value };
                                      updateAllocatedDays(shifts);
                                      
                                      // Always validate the sum
                                      const newTotal = shifts.reduce((sum: number, shift: any) => {
                                        return sum + (Number(shift?.noofdays) || 0);
                                      }, 0);
                                      
                                      if (newTotal !== totalDays) {
                                        form.setFields([
                                          {
                                            name: ['shifts', name, 'noofdays'],
                                            errors: [`Sum must equal exactly ${totalDays} days`]
                                          }
                                        ]);
                                      } else {
                                        form.setFields([
                                          {
                                            name: ['shifts', name, 'noofdays'],
                                            errors: []
                                          }
                                        ]);
                                      }
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block
                        size="large"
                        disabled={
                          fields.length >= 3 || 
                          allocatedDays >= totalDays
                        }
                        style={{ 
                          borderRadius: '8px',
                          height: '48px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        + Add Shift Rotation
                      </Button>
                    </>
                  )}
                </Form.List>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{ 
                  borderRadius: '8px',
                  padding: '0 32px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  minWidth: '200px'
                }}
              >
                Submit Request
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ShiftChangeForm;