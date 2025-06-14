import React, { useState, useEffect } from 'react';
import { 
  Package, Warehouse, MapPin, Clock, ArrowLeft, ArrowRight, 
  CheckCircle, XCircle, AlertTriangle, Search, Filter 
} from 'lucide-react';
import { warehouseAssignmentService, PendingAssignment, WarehousePosition } from '../../services/warehouseAssignmentService';
import { warehouseService } from '../../services/warehouseService';

export const WarehouseAssignments: React.FC = () => {
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<PendingAssignment | null>(null);
  const [availablePositions, setAvailablePositions] = useState<WarehousePosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<WarehousePosition | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingAssignments();

    // Subscribe to new assignments
    const unsubscribe = warehouseAssignmentService.onAssignment(() => {
      loadPendingAssignments();
      setSelectedAssignment(null);
      setSelectedPosition(null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadAvailablePositions(selectedAssignment.assignedWarehouseId);
    }
  }, [selectedAssignment]);

  const loadPendingAssignments = () => {
    const assignments = warehouseAssignmentService.getPendingAssignments();
    setPendingAssignments(assignments);
  };

  const loadAvailablePositions = (warehouseId: string) => {
    const positions = warehouseAssignmentService.getAvailablePositions(warehouseId);
    setAvailablePositions(positions);
  };

  const handleSelectAssignment = (assignment: PendingAssignment) => {
    setSelectedAssignment(assignment);
    setSelectedPosition(null);
    setAssignmentNotes('');
  };

  const handleAssignPosition = async () => {
    if (!selectedAssignment || !selectedPosition) return;

    setIsAssigning(true);
    try {
      const success = await warehouseAssignmentService.assignPosition(
        selectedAssignment.id,
        selectedPosition.id,
        'current-user', // Would come from auth context
        assignmentNotes
      );

      if (success) {
        alert(`✅ Position ${selectedPosition.section}${selectedPosition.aisle}-${selectedPosition.shelf}-${selectedPosition.position} assigned to ${selectedAssignment.productName}`);
        setSelectedAssignment(null);
        setSelectedPosition(null);
        setAssignmentNotes('');
      } else {
        alert('❌ Failed to assign position. Please try again.');
      }
    } catch (error) {
      alert('❌ Error assigning position.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleMoveForward = async (assignment: PendingAssignment) => {
    const reason = prompt('Please provide a reason for moving this assignment forward:');
    if (!reason) return;

    const success = await warehouseAssignmentService.moveForward(
      assignment.id,
      'current-user',
      reason
    );

    if (success) {
      alert(`✅ ${assignment.productName} moved forward and auto-assigned`);
    } else {
      alert('❌ Failed to move forward. No available positions.');
    }
  };

  const handleMoveBackward = async (assignment: PendingAssignment) => {
    const reason = prompt('Please provide a reason for moving this assignment back to queue:');
    if (!reason) return;

    const success = await warehouseAssignmentService.moveBackward(
      assignment.id,
      'current-user',
      reason
    );

    if (success) {
      alert(`✅ ${assignment.productName} moved back to capacity queue`);
    } else {
      alert('❌ Failed to move backward.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWaitTime = (receivedAt: string) => {
    const wait = new Date().getTime() - new Date(receivedAt).getTime();
    const hours = Math.floor(wait / 1000 / 60 / 60);
    const minutes = Math.floor((wait / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  // Filter assignments
  const filteredAssignments = pendingAssignments.filter(assignment => {
    const matchesPriority = filterPriority === 'all' || assignment.priority === filterPriority;
    const matchesSearch = !searchTerm || 
      assignment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Position Assignments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Assign specific warehouse positions to products awaiting placement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Assignments List */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pending Assignments ({filteredAssignments.length})
                </h3>
                
                {/* Filters */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => handleSelectAssignment(assignment)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssignment?.id === assignment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{assignment.queuePosition}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {assignment.productName}
                        </h4>
                        
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <Package className="w-3 h-3 mr-1" />
                            {assignment.supplier}
                          </div>
                          <div className="flex items-center">
                            <Warehouse className="w-3 h-3 mr-1" />
                            {assignment.warehouseName}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Wait: {formatWaitTime(assignment.receivedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col space-y-1 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveForward(assignment);
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Move Forward (Auto-assign)"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveBackward(assignment);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Move Backward (Return to queue)"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No pending assignments found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Position Assignment Panel */}
        <div>
          {selectedAssignment ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign Position: {selectedAssignment.productName}
                </h3>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Warehouse:</strong> {selectedAssignment.warehouseName}<br />
                    <strong>Supplier:</strong> {selectedAssignment.supplier}<br />
                    <strong>Queue Position:</strong> #{selectedAssignment.queuePosition}<br />
                    <strong>Priority:</strong> <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedAssignment.priority)}`}>{selectedAssignment.priority}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Positions ({availablePositions.length})
                  </label>
                  
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {availablePositions.map((position) => (
                      <div
                        key={position.id}
                        onClick={() => setSelectedPosition(position)}
                        className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedPosition?.id === position.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-sm">
                              {position.section}{position.aisle}-{position.shelf}-{position.position}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Capacity: {position.capacity}
                          </span>
                        </div>
                      </div>
                    ))}

                    {availablePositions.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <AlertTriangle className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
                        <p className="text-sm">No available positions in this warehouse</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPosition && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Notes (Optional)
                    </label>
                    <textarea
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Add any notes about this assignment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleAssignPosition}
                    disabled={!selectedPosition || isAssigning}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Assign Position
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Assignment
                </h3>
                <p className="text-sm text-gray-500">
                  Choose a pending assignment from the list to assign a warehouse position.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};