import React, { useState ,useEffect} from "react";
import { SERVERID } from "@/app/Constaint";
import { useSearchParams ,usePathname} from "next/navigation";
import HomeComponent from "./HomeComponent";
import AddZoneModal from "./Modals/AddZoneModel";
import ConfirmationModal from './Modals/ConfirmationModal'
import ZoneComponent from './ZoneComponent';


import { useNodeStatusEffects } from "./SidebarEffects/NodeStatusEffects";
import { useDataFetchingEffects } from "./SidebarEffects/DataFetchingEffects";
import { useFormEffects } from "./SidebarEffects/FormEffects";
import { useCircleHandlers } from "./Modals/SidebarHandlers/CircleHandlers";
import { useConfirmationHandlers } from "./Modals/SidebarHandlers/ConfirmationHandlers";
import {useZoneHandlers} from './Modals/SidebarHandlers/ZoneHandlers';
const SideBarWrapper = ({ children }) => {

    const pathname=usePathname();
    const isZonesPage = pathname === "/nfsddwdmems/zones";

  // Tree structure states
  const [showZone, setShowZone] = useState(false);
  const [showCircle, setShowCircle] = useState({});
  const [showNode, setShowNode] = useState({});
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showZoneOptionsModal, setShowZoneOptionsModal] = useState({
    visible: false,
    zoneId: null,
    zoneName: "",
  });
  const [showAddCircleModal, setShowAddCircleModal] = useState(false);
  const [showRemoveZoneModal, setShowRemoveZoneModal] = useState(false);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [showCircleOptionsModal, setShowCircleOptionsModal] = useState({
    visible: false,
    zoneId: null,
    circleId: null,
    circleName: "",
  });
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showEditCircleModal, setShowEditCircleModal] = useState(false);
  const [showRemoveCircleModal, setShowRemoveCircleModal] = useState(false);
  const [showNodeOptionsModal, setShowNodeOptionsModal] = useState({
    visible: false,
    zoneId: null,
    circleId: null,
    node: null,
  });
  const [showEditNodeModal, setShowEditNodeModal] = useState({
    visible: false,
    node: null,
  });
  const [showRemoveNodeModal, setShowRemoveNodeModal] = useState({
    visible: false,
    zoneId: "",
    circleId: "",
    nodeIp: "",
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState({
    visible: false,
    action: null,
    message: "",
    onConfirm: () => {},
  });
  type Zone = {
  zoneId: number;
  zoneName: string;
};

  // Form states
  const [newZoneName, setNewZoneName] = useState("");
  const [newCircleName, setNewCircleName] = useState("");
  const [topologyType, setTopologyType] = useState("");
  const [zoneToEdit, setZoneToEdit] = useState("");
  const [editedZoneName, setEditedZoneName] = useState("");
  const [circleToEdit, setCircleToEdit] = useState("");
  const [editedCircleName, setEditedCircleName] = useState("");
  const [nodeZoneId, setNodeZoneId] = useState("");
  const [nodeCircleId, setNodeCircleId] = useState("");
  const [nodeType, setNodeType] = useState("");
  const [adjacentNE, setAdjacentNE] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [description, setDescription] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [nodeSerialNumber, setNodeSerialNumber] = useState("");
  const [nodeInstallDate, setNodeInstallDate] = useState("");
  const [channelType, setChannelType] = useState("");

  // Node edit states
  const [editNodeZoneId, setEditNodeZoneId] = useState("");
  const [editNodeCircleId, setEditNodeCircleId] = useState("");
  const [editIpAddress, setEditIpAddress] = useState("");
  const [editNodeType, setEditNodeType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editNodeName, setEditNodeName] = useState("");
  const [editLocationName, setEditLocationName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editContactNumber, setEditContactNumber] = useState("");
  const [editNodeSerialNumber, setEditNodeSerialNumber] = useState("");
  const [editNodeInstallDate, setEditNodeInstallDate] = useState("");
  const [editChannelType, setEditChannelType] = useState("");
  const [editNewIpAddress, setEditNewIpAddress] = useState("");
  const [isDeconfigured, setIsDeconfigured] = useState(false);

  // Data states
    const [zones, setZones] = useState<Zone[]>([]);
  const [circles, setCircles] = useState({});
  const [nodes, setNodes] = useState({});
  const [loading, setLoading] = useState({
    zones: false,
    circles: false,
    nodes: false,
  });
  const [ipStatus, setIpStatus] = useState({});
  const [allNodeIPs, setAllNodeIPs] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNodeStatusPolling, setIsNodeStatusPolling] = useState(false);
  const [lastAddedNode, setLastAddedNode] = useState(null);
  const [showConfigureButton, setShowConfigureButton] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nodeToRemove, setNodeToRemove] = useState(null);

  

useEffect(() => {
  if (pathname === "/nfsddwdmems/zones") {
    setShowZone(true);
  }
}, [pathname]);


  const toggleCircle = (zoneId) => {
    setShowCircle((prev) => ({
      ...prev,
      [zoneId]: !prev[zoneId],
    }));
  };

  const toggleNode = (circleId) => {
    setShowNode((prev) => ({
      ...prev,
      [circleId]: !prev[circleId],
    }));
  };


const fetchAndSetNodeDetails = async (nodeId) => {
  if (!nodeId) return;

  setIsLoadingDetails(true);

  try {

    let token = JSON.parse(localStorage.getItem("emsToken"));
    if (!token) {
      throw new Error("Authentication token not found");
    }


    let foundCircleId = null;
    let foundZoneId = null;

    /* -------- Find Zone & Circle (FIXED ID) -------- */
    for (const [zoneId, zoneCircles] of Object.entries(circles)) {
      for (const circleId of Object.keys(zoneCircles)) {
        if (
          nodes[circleId]?.some(
            (n) => n.nodeDetailsId === nodeId   // ✅ FIX
          )
        ) {
          foundCircleId = circleId;
          foundZoneId = zoneId;
          break;
        }
      }
      if (foundCircleId) break;
    }

    if (!foundCircleId || !foundZoneId) {
      throw new Error("Node not found in zone/circle");
    }

    /* -------- API CALL -------- */
    const response = await fetch(
      `http://${SERVERID}/api/v1/nodes/${nodeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch node details");
    }

    const json = await response.json();
    const nodeDetails = json?.data || {};

    /* -------- Mappings -------- */
    const typeMap = {
      TERMINAL: "Terminal",
      AMPLIFIER: "Amplifier",
      ROADM: "Roadm",
      REGENERATOR: "Regenerator",
      TERMINALWITHACSUPPLY: "TerminalwithAcSupply",
    };

    const channelMap = {
      MEDIUM: "medium",
      SMALL: "small",
      INBUILT: "inbuilt",
      EXTERNAL: "external",
    };

    /* -------- SET STATE (ORDER MATTERS) -------- */

    // 1️⃣ Zone
    setEditNodeZoneId(foundZoneId);

    // 2️⃣ Circle (after zone)
    setEditNodeCircleId(foundCircleId);

    const isDeconfiguredNode = nodeDetails.nodeIP === "0.0.0.0";

    setEditIpAddress(nodeDetails.nodeIP || "");
setIsDeconfigured(isDeconfiguredNode);

// 🚫 DO NOT autofill for deconfigured node
if (!isDeconfiguredNode) {
  setEditNodeType(typeMap[nodeDetails.nodeType] || "");
  setEditNodeName(nodeDetails.nodeName || "");
} else {
  setEditNodeType("");
  setEditNodeName("");
}

    setEditLocationName(nodeDetails.nodeLocation || "");
    setEditContactPerson(nodeDetails.nodeContactPerson || "");
    setEditContactNumber(nodeDetails.nodePhoneNumber || "");
    setEditDescription(nodeDetails.nodeDescription || "");
    setEditNodeSerialNumber(nodeDetails.nodeSerialNumber || "");
    setEditNodeInstallDate(nodeDetails.nodeInstallationDate || "");

    setEditChannelType(
      channelMap[nodeDetails.nodeChannelNumber?.toUpperCase()] || ""
    );

  } catch (error) {
    console.error("Error fetching node details:", error);
    setErrorMessage("Failed to load node details");
  } finally {
    setIsLoadingDetails(false);
  }
};


  // Use effects
  useNodeStatusEffects({
    SERVERID,
    setIsNodeStatusPolling,
    nodes,
    ipStatus,
    setIpStatus,
  });

  useDataFetchingEffects({
    SERVERID,
    showZone,
    showCircle,
    showNode,
    zoneToEdit,
    nodeZoneId,
    nodeCircleId,
    editNodeZoneId,
    showRemoveNodeModal,
    setZones,
    setCircles,
    setNodes,
    setLoading,
    setIpStatus,
    nodes,
    circles,
  });

  useFormEffects({
    editNodeCircleId,
    setShowNode,
    editNodeType,
    setEditChannelType,
    showEditNodeModal,
    setLoading,
    setAllNodeIPs,
    fetchAndSetNodeDetails,
    setEditNewIpAddress,
    setIsDeconfigured,
    setErrorMessage,
    setSuccessMessage,
    lastAddedNode,
    setNodes,
    SERVERID,
  });

  // Use handlers
  const { handleAddZone, handleEditZone, handleRemoveZone } = useZoneHandlers({
    SERVERID,
    zones,
    setZones,
    newZoneName,
    setNewZoneName,
    zoneToEdit,
    setZoneToEdit,
    editedZoneName,
    setEditedZoneName,
    setLoadingOperation,
    setErrorMessage,
    setSuccessMessage,
  });

  const { handleAddCircle, handleEditCircle, handleRemoveCircle } =
    useCircleHandlers({
      SERVERID,
      zones,
      circles,
      setCircles,
      nodes,
      setNodes,
      newCircleName,
      setNewCircleName,
      zoneToEdit,
      setZoneToEdit,
      topologyType,
      setTopologyType,
      circleToEdit,
      setCircleToEdit,
      editedCircleName,
      setEditedCircleName,
      setLoadingOperation,
      setErrorMessage,
      setSuccessMessage,
      setShowCircle,
    });

    const {
  confirmAddZone,
  confirmEditZone,
  confirmRemoveZone,
  confirmAddCircle,
  confirmEditCircle,
  confirmRemoveCircle,
  confirmAddNode,
  confirmConfigureNode,
  confirmDeconfigureNode,
  confirmModifyNode,
  confirmRemoveNode
} = useConfirmationHandlers({
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
  handleAddZone,
  handleEditZone,
  handleRemoveZone,
  handleAddCircle,
  handleEditCircle,
  handleRemoveCircle,
  handleAddNode: () => {},
  handleConfigureNode: () => {},
  handleDeconfigureNode: () => {},
  handleModifyNode: () => {},
  handleRemoveNode: () => {},
});

  return (
    <>
      <style>
        {`
          .custom-select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1rem;
          }
        `}
      </style>
      <button
  onClick={() => setIsSidebarOpen(true)}
  className="lg:hidden fixed top-4 left-4 z-50 bg-white text-black p-2 rounded shadow"
>
  ☰
</button>
<div className="flex h-screen relative">

  {/* Mobile overlay */}
  {isSidebarOpen && (
    <div
      onClick={() => setIsSidebarOpen(false)}
      className="fixed inset-0 bg-black/40 z-40 lg:hidden"
    />
  )}

  {/* Sidebar */}
<div className={`
  fixed lg:static top-0 left-0 min-h-screen z-50
  bg-white border-r border-gray-300 shadow-sm
  w-full sm:w-[360px]
  h-auto
  transform transition-transform duration-300
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0

`}>


    <button
      onClick={() => setIsSidebarOpen(false)}
      className="lg:hidden absolute top-4 right-4 text-xl text-black"
    >
      ✕
    </button>

    <HomeComponent
      showZone={showZone}
      toggleZone={() => setShowZone((prev) => !prev)}
      setShowAddZoneModal={setShowAddZoneModal}
    />

    {showZone && (
      <div className="pl-6">
        {loading.zones ? (
          <div className="text-gray-500 py-1 px-2">Loading zones...</div>
        ) : Object.keys(zones).length === 0 ? (
          <div className="text-gray-500 py-1 px-2">No zones found</div>
        ) : (
          zones.map((zone) => (
            <ZoneComponent
              key={zone.zoneId}
              zoneId={zone.zoneId}
              zoneName={zone.zoneName}
              setShowZoneOptionsModal={setShowZoneOptionsModal}
            />
          ))
        )}
      </div>
    )}
  </div>

  {/* Main content */}
  <div className="flex-1 bg-gray-50 relative min-h-screen ">
          {children}

        
         <AddZoneModal
       
            showAddZoneModal={showAddZoneModal}
            setShowAddZoneModal={setShowAddZoneModal}
            newZoneName={newZoneName}
            setNewZoneName={setNewZoneName}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            loadingOperation={loadingOperation}
            confirmAddZone={confirmAddZone}

          />
          


          

  

          

          <ConfirmationModal
            showConfirmationModal={showConfirmationModal}
            setShowConfirmationModal={setShowConfirmationModal}
          />
        </div>
      </div>
    </>
  );
};

export default SideBarWrapper;

