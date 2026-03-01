export const useConfirmationHandlers = ({
  newZoneName,
  zones,
  zoneToEdit,
  editedZoneName,
  newCircleName,
  circles,
  circleToEdit,
  editedCircleName,
  nodeZoneId,
  nodeCircleId,
  nodeName,
  showEditNodeModal,
  editNodeName,
  editIpAddress,
  editNewIpAddress,
  nodeToRemove,
  setShowConfirmationModal,
  setZones,
  setCircles,
  setNodes,
}) => {

  // --- Zone Handlers ---
  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    const newZone = { zoneId: Date.now(), zoneName: newZoneName.trim() };
    setZones(prev => [...prev, newZone]);
  };

  const handleEditZone = () => {
    if (!zoneToEdit || !editedZoneName.trim()) return;
    setZones(prev =>
      prev.map(z => z.zoneId === zoneToEdit ? { ...z, zoneName: editedZoneName.trim() } : z)
    );
  };

  const handleRemoveZone = () => {
    if (!zoneToEdit) return;
    setZones(prev => prev.filter(z => z.zoneId !== zoneToEdit));
    setCircles(prev => {
      const copy = { ...prev };
      delete copy[zoneToEdit];
      return copy;
    });
  };

  // --- Circle Handlers ---
  const handleAddCircle = () => {
    if (!zoneToEdit || !newCircleName.trim()) return;
    const circleName = newCircleName.trim();
    setCircles(prev => ({
      ...prev,
      [zoneToEdit]: [...(prev[zoneToEdit] || []), circleName]
    }));
  };

  const handleEditCircle = () => {
    if (!zoneToEdit || !circleToEdit || !editedCircleName.trim()) return;
    setCircles(prev => ({
      ...prev,
      [zoneToEdit]: prev[zoneToEdit].map((c, idx) =>
        idx === circleToEdit ? editedCircleName.trim() : c
      )
    }));
  };

  const handleRemoveCircle = () => {
    if (!zoneToEdit || circleToEdit == null) return;
    setCircles(prev => ({
      ...prev,
      [zoneToEdit]: prev[zoneToEdit].filter((_, idx) => idx !== circleToEdit)
    }));
  };

  // --- Node Handlers ---
  const handleAddNode = () => {
    if (!nodeZoneId || !nodeCircleId || !nodeName.trim()) return;
    setNodes(prev => ({
      ...prev,
      [nodeZoneId]: {
        ...prev[nodeZoneId],
        [nodeCircleId]: [...(prev[nodeZoneId]?.[nodeCircleId] || []), nodeName.trim()]
      }
    }));
  };

  const handleConfigureNode = () => {
    if (!editNodeName || !editIpAddress) return;
    // implement your configure logic here immutably
  };

  const handleDeconfigureNode = () => {
    if (!showEditNodeModal.node) return;
    // implement your deconfigure logic here immutably
  };

  const handleModifyNode = () => {
    if (!editNodeName) return;
    // implement modify node logic immutably
  };

  const handleRemoveNode = () => {
    if (!nodeToRemove) return;
    const { zoneId, circleId, nodeIndex } = nodeToRemove;
    setNodes(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [circleId]: prev[zoneId][circleId].filter((_, idx) => idx !== nodeIndex)
      }
    }));
  };

  // --- Confirmation Functions ---
  const confirmAction = (message: string, onConfirm: () => void) => {
    setShowConfirmationModal({
      visible: true,
      message,
      action: null,
      onConfirm
    });
  };

  const confirmAddZone = () => {
    if (!newZoneName.trim()) return;
    confirmAction(`Do you want to add zone "${newZoneName.trim()}"?`, handleAddZone);
  };

  const confirmEditZone = () => {
    if (!zoneToEdit || !editedZoneName.trim()) return;
    const oldName = zones.find(z => z.zoneId === zoneToEdit)?.zoneName || "";
    confirmAction(
      `Do you want to change zone name from "${oldName}" to "${editedZoneName.trim()}"?`,
      handleEditZone
    );
  };

  const confirmRemoveZone = () => {
    if (!zoneToEdit) return;
    const oldName = zones.find(z => z.zoneId === zoneToEdit)?.zoneName || "";
    confirmAction(
      `Do you want to remove zone "${oldName}"?`,
      handleRemoveZone
    );
  };

  const confirmAddCircle = () => {
    if (!zoneToEdit || !newCircleName.trim()) return;
    const zoneName = zones.find(z => String(z.zoneId) === String(zoneToEdit))?.zoneName || "";
    confirmAction(
      `Do you want to add circle "${newCircleName.trim()}" to zone "${zoneName}"?`,
      handleAddCircle
    );
  };

  const confirmEditCircle = () => {
    if (!zoneToEdit || !circleToEdit || !editedCircleName.trim()) return;
    confirmAction(
      `Do you want to change circle name to "${editedCircleName.trim()}"?`,
      handleEditCircle
    );
  };

  const confirmRemoveCircle = () => {
    if (!zoneToEdit || circleToEdit == null) return;
    confirmAction(
      `Do you want to remove this circle?`,
      handleRemoveCircle
    );
  };

  const confirmAddNode = () => {
    if (!nodeZoneId || !nodeCircleId || !nodeName.trim()) return;
    confirmAction(
      `Do you want to add node "${nodeName.trim()}"?`,
      handleAddNode
    );
  };

  const confirmRemoveNode = () => {
    if (!nodeToRemove) return;
    confirmAction(
      `Do you want to remove node "${nodeToRemove.nodeName}"? This action cannot be undone.`,
      handleRemoveNode
    );
  };

  return {
    confirmAddZone,
    confirmEditZone,
    confirmRemoveZone,
    confirmAddCircle,
    confirmEditCircle,
    confirmRemoveCircle,
    confirmAddNode,
    confirmRemoveNode,
    handleConfigureNode,
    handleDeconfigureNode,
    handleModifyNode
  };
};
