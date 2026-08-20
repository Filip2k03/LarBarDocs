#!/usr/bin/env python3
"""
Master Draw.io Multi-Page Generator for Taxi Application Architecture
Includes Guardian Dynamic Feature Plugin / On-Demand Installable Package Architecture
UML 2.5 Compliant, Black & White / High-Contrast Grayscale, Conflict-Free Line Routing
"""

import os
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

OUTPUT_DIR = "/Users/stephanfilip/Yamato_project/Labar/diagrams/drawio"
ROOT_OUTPUT = "/Users/stephanfilip/Yamato_project/Labar"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_mxfile():
    return ET.Element("mxfile", {
        "host": "app.diagrams.net",
        "modified": "2026-08-20T15:10:00.000Z",
        "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "version": "24.7.5",
        "type": "device"
    })

def add_diagram_tab(mxfile, diagram_id, name, width=2400, height=1800):
    diagram = ET.SubElement(mxfile, "diagram", {"id": diagram_id, "name": name})
    model = ET.SubElement(diagram, "mxGraphModel", {
        "dx": "1422", "dy": "794", "grid": "1", "gridSize": "10",
        "guides": "1", "tooltips": "1", "connect": "1", "arrows": "1",
        "fold": "1", "page": "1", "pageScale": "1",
        "pageWidth": str(width), "pageHeight": str(height),
        "math": "0", "shadow": "0"
    })
    root = ET.SubElement(model, "root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})
    return root

def add_cell(root, cell_id, value, style, x, y, width, height, parent="1", is_vertex=True):
    cell = ET.SubElement(root, "mxCell", {
        "id": cell_id,
        "value": value,
        "style": style,
        "parent": parent
    })
    if is_vertex:
        cell.set("vertex", "1")
    ET.SubElement(cell, "mxGeometry", {
        "x": str(x), "y": str(y), "width": str(width), "height": str(height), "as": "geometry"
    })
    return cell

def add_edge(root, edge_id, value, style, source_id, target_id, parent="1", points=None, exit_xy=None, entry_xy=None):
    edge_style = style
    if exit_xy:
        edge_style += f"exitX={exit_xy[0]};exitY={exit_xy[1]};exitDx=0;exitDy=0;"
    if entry_xy:
        edge_style += f"entryX={entry_xy[0]};entryY={entry_xy[1]};entryDx=0;entryDy=0;"
    
    cell = ET.SubElement(root, "mxCell", {
        "id": edge_id,
        "value": value,
        "style": edge_style,
        "edge": "1",
        "parent": parent,
        "source": source_id,
        "target": target_id
    })
    geo = ET.SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
    if points:
        pts_elem = ET.SubElement(geo, "Array", {"as": "points"})
        for px, py in points:
            ET.SubElement(pts_elem, "mxPoint", {"x": str(px), "y": str(py)})
    return cell

# =============================================================================
# TAB 1: UML 2.5 USE CASE MODEL
# =============================================================================
def build_use_case_tab(root):
    add_cell(root, "uc_sb", "<b>Taxi Application Platform Boundary</b>",
             "swimlane;whiteSpace=wrap;html=1;fillColor=#FAFAFA;strokeColor=#000000;strokeWidth=2;strokeDasharray=4 4;fontColor=#000000;startSize=30;horizontal=1;align=center;fontStyle=1;fontSize=14;",
             280, 40, 960, 1120)

    actor_style = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=12;"
    add_cell(root, "act_p", "<b>Passenger</b>\n(User App)", actor_style, 60, 180, 70, 120)
    add_cell(root, "act_dr", "<b>Driver</b>\n(Driver App)", actor_style, 60, 680, 70, 120)
    add_cell(root, "act_g", "<b>Guardian / Family</b>\n(Guardian Mode)", actor_style, 1340, 180, 70, 120)
    add_cell(root, "act_pay", "<b>Payment Gateway</b>\n(KBZPay / AYAPay)", actor_style, 1340, 680, 70, 120)
    add_cell(root, "act_cloud", "<b>CCTV Cloud Vault</b>\n(Encrypted S3)", actor_style, 1340, 940, 70, 120)

    sub_pkg = "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#444444;strokeWidth=1;strokeDasharray=2 2;fontColor=#000000;startSize=24;horizontal=1;fontStyle=1;fontSize=11;"
    add_cell(root, "pkg_1", "1. Authentication & Profile", sub_pkg, 310, 80, 420, 240, parent="uc_sb")
    add_cell(root, "pkg_2", "2. Booking & Dispatch", sub_pkg, 310, 340, 420, 360, parent="uc_sb")
    add_cell(root, "pkg_3", "3. Ride Safety & Monitoring", sub_pkg, 760, 80, 450, 420, parent="uc_sb")
    add_cell(root, "pkg_4", "4. Payment & Settlement", sub_pkg, 310, 720, 900, 360, parent="uc_sb")

    uc_style = "ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=10;"

    add_cell(root, "uc_1", "UC-01: Register / First Login", uc_style, 330, 115, 170, 45, parent="uc_sb")
    add_cell(root, "uc_2", "UC-02: Manage Profile & Info", uc_style, 530, 115, 180, 45, parent="uc_sb")
    add_cell(root, "uc_3", "UC-03: Manage Favorite Locations", uc_style, 330, 180, 180, 45, parent="uc_sb")
    add_cell(root, "uc_4", "UC-04: Add Family Guardians", uc_style, 530, 180, 180, 45, parent="uc_sb")
    add_cell(root, "uc_5", "UC-05: Driver Shift Status Toggle", uc_style, 330, 250, 190, 45, parent="uc_sb")

    add_cell(root, "uc_6", "UC-06: Choose Ride Pickup Point", uc_style, 330, 375, 180, 45, parent="uc_sb")
    add_cell(root, "uc_7", "UC-07: Choose Destination Point", uc_style, 530, 375, 180, 45, parent="uc_sb")
    add_cell(root, "uc_8", "UC-08: Add Extra Waypoints/Stops", uc_style, 530, 440, 180, 45, parent="uc_sb")
    add_cell(root, "uc_9", "UC-09: Calculate Fare & Route", uc_style, 330, 440, 180, 45, parent="uc_sb")
    add_cell(root, "uc_10", "UC-10: Request Taxi (Call Now)", uc_style, 330, 510, 180, 45, parent="uc_sb")
    add_cell(root, "uc_11", "UC-11: Dispatch to Nearest Driver", uc_style, 530, 510, 180, 45, parent="uc_sb")
    add_cell(root, "uc_12", "UC-12: Cascade to Next Driver", uc_style, 530, 575, 180, 45, parent="uc_sb")
    add_cell(root, "uc_13", "UC-13: Accept / Reject Ride", uc_style, 330, 575, 180, 45, parent="uc_sb")
    add_cell(root, "uc_14", "UC-14: In-App Chat (User <-> Driver)", uc_style, 330, 640, 200, 45, parent="uc_sb")

    add_cell(root, "uc_15", "UC-15: Start Ride & Meter Navigation", uc_style, 790, 115, 200, 45, parent="uc_sb")
    add_cell(root, "uc_16", "UC-16: Activate Guardian Live Stream", uc_style, 1010, 115, 180, 45, parent="uc_sb")
    add_cell(root, "uc_17", "UC-17: Detect Route Deviation Alert", uc_style, 1010, 190, 180, 45, parent="uc_sb")
    add_cell(root, "uc_18", "UC-18: Protecting Mode: Record CCTV", uc_style, 790, 260, 200, 45, parent="uc_sb")
    add_cell(root, "uc_19", "UC-19: Stream / Upload CCTV to Cloud", uc_style, 1010, 260, 180, 45, parent="uc_sb")
    add_cell(root, "uc_20", "UC-20: Arrive at Destination", uc_style, 790, 340, 200, 45, parent="uc_sb")

    add_cell(root, "uc_21", "UC-21: Select Cash / Cashless Payment", uc_style, 330, 770, 220, 45, parent="uc_sb")
    add_cell(root, "uc_22", "UC-22: Settle Cash Payment", uc_style, 600, 770, 180, 45, parent="uc_sb")
    add_cell(root, "uc_23", "UC-23: Pay via E-Wallet Deep-Link", uc_style, 830, 770, 200, 45, parent="uc_sb")
    add_cell(root, "uc_24", "UC-24: Verify Webhook Signature", uc_style, 830, 840, 200, 45, parent="uc_sb")
    add_cell(root, "uc_25", "UC-25: View Daily Orders & Sales", uc_style, 330, 930, 200, 45, parent="uc_sb")
    add_cell(root, "uc_26", "UC-26: Transfer Sales / Driver Payout", uc_style, 600, 930, 220, 45, parent="uc_sb")

    edge_act = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.5;jumpStyle=arc;jumpSize=6;endArrow=none;"
    edge_inc = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.2;dashed=1;endArrow=open;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_edge(root, "ae_1", "", edge_act, "act_p", "uc_1", exit_xy=(1, 0.2), entry_xy=(0, 0.5))
    add_edge(root, "ae_2", "", edge_act, "act_p", "uc_2", exit_xy=(1, 0.3), entry_xy=(0, 0.5))
    add_edge(root, "ae_3", "", edge_act, "act_p", "uc_3", exit_xy=(1, 0.4), entry_xy=(0, 0.5))
    add_edge(root, "ae_4", "", edge_act, "act_p", "uc_4", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "ae_5", "", edge_act, "act_p", "uc_6", exit_xy=(1, 0.6), entry_xy=(0, 0.5))
    add_edge(root, "ae_6", "", edge_act, "act_p", "uc_7", exit_xy=(1, 0.7), entry_xy=(0, 0.5))
    add_edge(root, "ae_7", "", edge_act, "act_p", "uc_10", exit_xy=(1, 0.8), entry_xy=(0, 0.5))
    add_edge(root, "ae_8", "", edge_act, "act_p", "uc_14", exit_xy=(1, 0.9), entry_xy=(0, 0.5))
    add_edge(root, "ae_9", "", edge_act, "act_p", "uc_21", exit_xy=(1, 1.0), entry_xy=(0, 0.5))

    add_edge(root, "ae_10", "", edge_act, "act_dr", "uc_5", exit_xy=(1, 0.2), entry_xy=(0, 0.5))
    add_edge(root, "ae_11", "", edge_act, "act_dr", "uc_13", exit_xy=(1, 0.4), entry_xy=(0, 0.5))
    add_edge(root, "ae_12", "", edge_act, "act_dr", "uc_15", exit_xy=(1, 0.6), entry_xy=(0, 0.5))
    add_edge(root, "ae_13", "", edge_act, "act_dr", "uc_18", exit_xy=(1, 0.7), entry_xy=(0, 0.5))
    add_edge(root, "ae_14", "", edge_act, "act_dr", "uc_22", exit_xy=(1, 0.8), entry_xy=(0, 0.5))
    add_edge(root, "ae_15", "", edge_act, "act_dr", "uc_25", exit_xy=(1, 0.9), entry_xy=(0, 0.5))
    add_edge(root, "ae_16", "", edge_act, "act_dr", "uc_26", exit_xy=(1, 1.0), entry_xy=(0, 0.5))

    add_edge(root, "ae_17", "", edge_act, "uc_16", "act_g", exit_xy=(1, 0.5), entry_xy=(0, 0.4))
    add_edge(root, "ae_18", "", edge_act, "uc_17", "act_g", exit_xy=(1, 0.5), entry_xy=(0, 0.6))
    add_edge(root, "ae_19", "", edge_act, "uc_23", "act_pay", exit_xy=(1, 0.5), entry_xy=(0, 0.4))
    add_edge(root, "ae_20", "", edge_act, "uc_24", "act_pay", exit_xy=(1, 0.5), entry_xy=(0, 0.6))
    add_edge(root, "ae_21", "", edge_act, "uc_26", "act_pay", exit_xy=(1, 0.5), entry_xy=(0, 0.8))
    add_edge(root, "ae_22", "", edge_act, "uc_19", "act_cloud", exit_xy=(1, 0.5), entry_xy=(0, 0.5))

    add_edge(root, "ie_1", "&lt;&lt;extend&gt;&gt;", edge_inc, "uc_8", "uc_7")
    add_edge(root, "ie_2", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_10", "uc_9")
    add_edge(root, "ie_3", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_10", "uc_11")
    add_edge(root, "ie_4", "&lt;&lt;extend&gt;&gt;", edge_inc, "uc_12", "uc_11")
    add_edge(root, "ie_5", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_15", "uc_16")
    add_edge(root, "ie_6", "&lt;&lt;extend&gt;&gt;", edge_inc, "uc_17", "uc_16")
    add_edge(root, "ie_7", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_18", "uc_19")
    add_edge(root, "ie_8", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_23", "uc_24")


# =============================================================================
# TAB 2: SYSTEM PROCESS FLOWCHART (5 Swimlanes)
# =============================================================================
def build_flowchart_tab(root):
    p_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=10;"
    d_style = "rhombus;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=10;"
    s_style = "rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;strokeWidth=2;fontColor=#FFFFFF;fontStyle=1;fontSize=11;"
    safe_box = "rounded=0;whiteSpace=wrap;html=1;fillColor=#F7F7F7;strokeColor=#000000;strokeWidth=1.5;strokeDasharray=4 4;fontColor=#000000;fontStyle=1;fontSize=10;"
    edge_f = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "l_1", "<b>1. PASSENGER (USER APP)</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=28;fontColor=#000000;fontStyle=1;", 40, 40, 380, 1500)
    add_cell(root, "l_2", "<b>2. GO DISPATCH ENGINE</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=28;fontColor=#000000;fontStyle=1;", 450, 40, 380, 1500)
    add_cell(root, "l_3", "<b>3. DRIVER (DRIVER APP)</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=28;fontColor=#000000;fontStyle=1;", 860, 40, 380, 1500)
    add_cell(root, "l_4", "<b>4. SAFETY & GUARDIAN SHIELD</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=28;fontColor=#000000;fontStyle=1;", 1270, 40, 380, 1500)
    add_cell(root, "l_5", "<b>5. PAYMENT & SETTLEMENT</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=28;fontColor=#000000;fontStyle=1;", 1680, 40, 380, 1500)

    add_cell(root, "n_p1", "Passenger Opens App", s_style, 90, 80, 260, 40, parent="l_1")
    add_cell(root, "n_p2", "First Login?", d_style, 160, 140, 120, 50, parent="l_1")
    add_cell(root, "n_p3", "Register (Phone OTP, Profile)", p_style, 90, 215, 260, 35, parent="l_1")
    add_cell(root, "n_p4", "Landing Page (Call Taxi / Fav / Guardian)", p_style, 90, 275, 260, 40, parent="l_1")
    add_cell(root, "n_p5", "Choose Pickup (GPS/Map/Search/Fav)", p_style, 90, 340, 260, 40, parent="l_1")
    add_cell(root, "n_p6", "Choose Destination Point", p_style, 90, 405, 260, 40, parent="l_1")
    add_cell(root, "n_p7", "Add Extra Stop?", d_style, 160, 470, 120, 50, parent="l_1")
    add_cell(root, "n_p8", "Add Intermediate Waypoint", p_style, 90, 545, 260, 35, parent="l_1")
    add_cell(root, "n_p9", "Review Route Polyline & Fare", p_style, 90, 605, 260, 40, parent="l_1")
    add_cell(root, "n_p10", "Tap 'Call Now' (Request Ride)", s_style, 90, 670, 260, 40, parent="l_1")
    add_cell(root, "n_p11", "View Driver Profile & Live Map ETA", p_style, 90, 770, 260, 40, parent="l_1")
    add_cell(root, "n_p12", "In-App Chat Active with Driver", p_style, 90, 835, 260, 35, parent="l_1")
    add_cell(root, "n_p13", "Board Taxi & Start Ride", s_style, 90, 900, 260, 40, parent="l_1")
    add_cell(root, "n_p14", "Arrive Destination & Review Fare", p_style, 90, 1080, 260, 40, parent="l_1")
    add_cell(root, "n_p15", "Select Payment Method", d_style, 150, 1150, 140, 50, parent="l_1")
    add_cell(root, "n_p16", "Display 'Thank You' & Rating Screen", p_style, 90, 1370, 260, 40, parent="l_1")

    add_cell(root, "n_d1", "Compute Route & Dynamic Fare", p_style, 500, 605, 260, 40, parent="l_2")
    add_cell(root, "n_d2", "Spatial GEORADIUS 3km Search", p_style, 500, 670, 260, 40, parent="l_2")
    add_cell(root, "n_d3", "Send 15s Offer to Candidate Driver", p_style, 500, 735, 260, 40, parent="l_2")
    add_cell(root, "n_d4", "Driver Decision?", d_style, 570, 800, 120, 50, parent="l_2")
    add_cell(root, "n_d5", "Cascade to Next Nearest Driver", p_style, 500, 875, 260, 35, parent="l_2")
    add_cell(root, "n_d6", "Assign Driver & Open WebSocket Room", p_style, 500, 935, 260, 40, parent="l_2")

    add_cell(root, "n_dr1", "Driver Login & Verification", p_style, 910, 200, 260, 40, parent="l_3")
    add_cell(root, "n_dr2", "Toggle Status (Available / Break / Duty)", d_style, 960, 265, 160, 50, parent="l_3")
    add_cell(root, "n_dr3", "Receive Ride Offer Notification", p_style, 910, 735, 260, 40, parent="l_3")
    add_cell(root, "n_dr4", "Accept or Reject?", d_style, 970, 800, 140, 50, parent="l_3")
    add_cell(root, "n_dr5", "Navigate to Pickup Point", p_style, 910, 875, 260, 40, parent="l_3")
    add_cell(root, "n_dr6", "Tap 'Arrived Pickup' (Close Chat)", p_style, 910, 935, 260, 40, parent="l_3")
    add_cell(root, "n_dr7", "Tap 'Start Ride' -> Turn-by-Turn Meter", s_style, 910, 1005, 260, 40, parent="l_3")
    add_cell(root, "n_dr8", "Arrive Destination & Lock Fare", p_style, 910, 1080, 260, 40, parent="l_3")
    add_cell(root, "n_dr9", "Confirm Cash Received", p_style, 910, 1225, 260, 35, parent="l_3")
    add_cell(root, "n_dr10", "View Today's Sales Summary", p_style, 910, 1310, 260, 40, parent="l_3")
    add_cell(root, "n_dr11", "Transfer Sales (Payout to Wallet)", s_style, 910, 1370, 260, 40, parent="l_3")

    add_cell(root, "n_s1", "Activate Guardian Live Shield\n(Push 'Ride Started' to Family)", safe_box, 1320, 1005, 260, 45, parent="l_4")
    add_cell(root, "n_s2", "Stream Real-Time Live GPS to Family", safe_box, 1320, 1070, 260, 40, parent="l_4")
    add_cell(root, "n_s3", "Cross-Track Deviation > 300m?", d_style, 1370, 1135, 160, 50, parent="l_4")
    add_cell(root, "n_s4", "CRITICAL ALERT: Off-Route Warning", safe_box, 1320, 1210, 260, 40, parent="l_4")
    add_cell(root, "n_s5", "Protecting Mode: Record CCTV & GPS", safe_box, 1320, 900, 260, 40, parent="l_4")
    add_cell(root, "n_s6", "Stream / Upload Encrypted Video Chunks", safe_box, 1320, 955, 260, 40, parent="l_4")
    add_cell(root, "n_s7", "Trip Done: Push 'Safely Arrived' & Stop", safe_box, 1320, 1310, 260, 40, parent="l_4")

    add_cell(root, "n_pay1", "Select E-Wallet (KPay/AYAPay)", p_style, 1730, 1150, 260, 40, parent="l_5")
    add_cell(root, "n_pay2", "Deep-Link Jump to Wallet App", p_style, 1730, 1215, 260, 40, parent="l_5")
    add_cell(root, "n_pay3", "User PIN & Biometric Authorization", p_style, 1730, 1275, 260, 35, parent="l_5")
    add_cell(root, "n_pay4", "Deep-Link Return & Webhook Verify", p_style, 1730, 1330, 260, 40, parent="l_5")
    add_cell(root, "n_pay5", "Credit Driver Wallet Balance", s_style, 1730, 1390, 260, 40, parent="l_5")

    add_edge(root, "le_1", "", edge_f, "n_p1", "n_p2")
    add_edge(root, "le_2", "Yes", edge_f, "n_p2", "n_p3")
    add_edge(root, "le_3", "No", edge_f, "n_p2", "n_p4")
    add_edge(root, "le_4", "", edge_f, "n_p3", "n_p4")
    add_edge(root, "le_5", "", edge_f, "n_p4", "n_p5")
    add_edge(root, "le_6", "", edge_f, "n_p5", "n_p6")
    add_edge(root, "le_7", "", edge_f, "n_p6", "n_p7")
    add_edge(root, "le_8", "Yes", edge_f, "n_p7", "n_p8")
    add_edge(root, "le_9", "", edge_f, "n_p8", "n_p6")
    add_edge(root, "le_10", "No", edge_f, "n_p7", "n_d1")
    add_edge(root, "le_11", "", edge_f, "n_d1", "n_p9")
    add_edge(root, "le_12", "", edge_f, "n_p9", "n_p10")
    add_edge(root, "le_13", "", edge_f, "n_p10", "n_d2")
    add_edge(root, "le_14", "", edge_f, "n_d2", "n_d3")
    add_edge(root, "le_15", "", edge_f, "n_d3", "n_dr3")
    add_edge(root, "le_16", "", edge_f, "n_dr3", "n_dr4")
    add_edge(root, "le_17", "Reject/Timeout", edge_f, "n_dr4", "n_d5")
    add_edge(root, "le_18", "", edge_f, "n_d5", "n_d3")
    add_edge(root, "le_19", "Accept", edge_f, "n_dr4", "n_d6")
    add_edge(root, "le_20", "", edge_f, "n_d6", "n_p11")
    add_edge(root, "le_21", "", edge_f, "n_d6", "n_dr5")
    add_edge(root, "le_22", "", edge_f, "n_p11", "n_p12")
    add_edge(root, "le_23", "", edge_f, "n_dr5", "n_dr6")
    add_edge(root, "le_24", "", edge_f, "n_dr6", "n_p13")
    add_edge(root, "le_25", "", edge_f, "n_p13", "n_dr7")
    add_edge(root, "le_26", "", edge_f, "n_dr7", "n_s1")
    add_edge(root, "le_27", "", edge_f, "n_dr7", "n_s5")
    add_edge(root, "le_28", "", edge_f, "n_s5", "n_s6")
    add_edge(root, "le_29", "", edge_f, "n_s1", "n_s2")
    add_edge(root, "le_30", "", edge_f, "n_s2", "n_s3")
    add_edge(root, "le_31", "Yes", edge_f, "n_s3", "n_s4")
    add_edge(root, "le_32", "No", edge_f, "n_s3", "n_dr8")
    add_edge(root, "le_33", "", edge_f, "n_dr8", "n_p14")
    add_edge(root, "le_34", "", edge_f, "n_p14", "n_p15")
    add_edge(root, "le_35", "Cash", edge_f, "n_p15", "n_dr9")
    add_edge(root, "le_36", "Cashless", edge_f, "n_p15", "n_pay1")
    add_edge(root, "le_37", "", edge_f, "n_pay1", "n_pay2")
    add_edge(root, "le_38", "", edge_f, "n_pay2", "n_pay3")
    add_edge(root, "le_39", "", edge_f, "n_pay3", "n_pay4")
    add_edge(root, "le_40", "", edge_f, "n_pay4", "n_pay5")
    add_edge(root, "le_41", "", edge_f, "n_dr9", "n_s7")
    add_edge(root, "le_42", "", edge_f, "n_pay5", "n_s7")
    add_edge(root, "le_43", "", edge_f, "n_s7", "n_p16")
    add_edge(root, "le_44", "", edge_f, "n_pay5", "n_dr10")
    add_edge(root, "le_45", "", edge_f, "n_dr10", "n_dr11")


# =============================================================================
# TAB 3: DATABASE ERD SCHEMA (16 Tables)
# =============================================================================
def build_erd_tab(root):
    table_style = "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=12;"
    row_pk = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#000000;fontSize=10;fontStyle=1;"
    row_norm = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#000000;fontSize=10;"
    edge_erd = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;endArrow=ERmany;startArrow=ERone;endFill=0;startFill=0;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    def create_table(tid, title, x, y, width, rows):
        t_height = 26 + len(rows) * 20
        tbl = add_cell(root, tid, f"<b>{title}</b>", table_style, x, y, width, t_height)
        for i, (is_pk, txt) in enumerate(rows):
            r_style = row_pk if is_pk else row_norm
            add_cell(root, f"{tid}_r{i}", txt, r_style, 0, 26 + i * 20, width, 20, parent=tid)
        return tbl

    create_table("t_users", "USERS", 50, 40, 280, [
        (True, "PK  id: uuid"),
        (False, "UQ  phone_number: varchar(20)"),
        (False, "    full_name: varchar(100)"),
        (False, "UQ  email: varchar(100)"),
        (False, "    role: varchar(20)"),
        (False, "    avatar_url: text"),
        (False, "    is_active: boolean"),
        (False, "    created_at: timestamp"),
        (False, "    updated_at: timestamp")
    ])

    create_table("t_favs", "FAVORITE_LOCATIONS", 50, 310, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  user_id: uuid"),
        (False, "    label: varchar(50)"),
        (False, "    address_text: text"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_guardians", "GUARDIAN_RELATIONSHIPS", 50, 530, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  passenger_id: uuid"),
        (False, "FK  guardian_id: uuid"),
        (False, "    relationship_type: varchar(50)"),
        (False, "    is_active: boolean"),
        (False, "    notify_ride_start: boolean"),
        (False, "    notify_deviation: boolean"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_safety_alerts", "SAFETY_ALERTS", 50, 770, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  triggered_by: uuid"),
        (False, "    alert_type: varchar(50)"),
        (False, "    deviation_meters: decimal"),
        (False, "    current_lat: decimal(10,8)"),
        (False, "    current_lng: decimal(11,8)"),
        (False, "    status: varchar(30)"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_drivers", "DRIVERS", 430, 40, 290, [
        (True, "PK  id: uuid"),
        (False, "FK  user_id: uuid"),
        (False, "UQ  license_number: varchar(50)"),
        (False, "UQ  national_id: varchar(50)"),
        (False, "    status: varchar(20)"),
        (False, "    current_lat: decimal(10,8)"),
        (False, "    current_lng: decimal(11,8)"),
        (False, "    rating_avg: decimal(3,2)"),
        (False, "    total_trips: integer"),
        (False, "    is_verified: boolean"),
        (False, "    last_status_update: timestamp"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_vehicles", "VEHICLES", 430, 360, 290, [
        (True, "PK  id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    make: varchar(50)"),
        (False, "    model: varchar(50)"),
        (False, "UQ  license_plate: varchar(20)"),
        (False, "    color: varchar(30)"),
        (False, "    manufacture_year: integer"),
        (False, "    cctv_device_serial: varchar(100)"),
        (False, "    is_active: boolean"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_status_logs", "DRIVER_STATUS_LOGS", 430, 640, 290, [
        (True, "PK  id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    previous_status: varchar(20)"),
        (False, "    new_status: varchar(20)"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    changed_at: timestamp")
    ])

    create_table("t_gps_logs", "GPS_TELEMETRY_LOGS", 430, 850, 290, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    speed_kmh: decimal(5,2)"),
        (False, "    heading_deg: decimal(5,2)"),
        (False, "    accuracy_meters: decimal(5,2)"),
        (False, "    recorded_at: timestamp")
    ])

    create_table("t_rides", "RIDES", 820, 40, 300, [
        (True, "PK  id: uuid"),
        (False, "FK  passenger_id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "FK  vehicle_id: uuid"),
        (False, "    status: varchar(30)"),
        (False, "    pickup_address: text"),
        (False, "    pickup_lat: decimal(10,8)"),
        (False, "    pickup_lng: decimal(11,8)"),
        (False, "    final_dest_address: text"),
        (False, "    final_dest_lat: decimal(10,8)"),
        (False, "    final_dest_lng: decimal(11,8)"),
        (False, "    estimated_dist_km: decimal(6,2)"),
        (False, "    estimated_dur_min: integer"),
        (False, "    estimated_fare: decimal(12,2)"),
        (False, "    actual_dist_km: decimal(6,2)"),
        (False, "    actual_dur_min: integer"),
        (False, "    actual_fare: decimal(12,2)"),
        (False, "    payment_method: varchar(20)"),
        (False, "    payment_status: varchar(20)"),
        (False, "    requested_at: timestamp"),
        (False, "    accepted_at: timestamp"),
        (False, "    ride_started_at: timestamp"),
        (False, "    ride_completed_at: timestamp"),
        (False, "    cancelled_at: timestamp")
    ])

    create_table("t_waypoints", "RIDE_WAYPOINTS", 820, 600, 300, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "    stop_order: integer"),
        (False, "    address_text: text"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    is_visited: boolean"),
        (False, "    visited_at: timestamp")
    ])

    create_table("t_dispatches", "RIDE_DISPATCHES", 820, 820, 300, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    dispatch_status: varchar(20)"),
        (False, "    driver_distance_km: decimal(5,2)"),
        (False, "    offered_at: timestamp"),
        (False, "    responded_at: timestamp"),
        (False, "    timeout_at: timestamp")
    ])

    create_table("t_cctv", "CCTV_RECORDINGS", 820, 1040, 300, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  vehicle_id: uuid"),
        (False, "    storage_file_key: text"),
        (False, "    cloud_storage_url: text"),
        (False, "    file_size_bytes: bigint"),
        (False, "    duration_seconds: integer"),
        (False, "    hash_sha256: varchar(64)"),
        (False, "    encryption_alg: varchar(30)"),
        (False, "    status: varchar(20)"),
        (False, "    recorded_from: timestamp"),
        (False, "    recorded_to: timestamp")
    ])

    create_table("t_chat", "CHAT_MESSAGES", 1220, 40, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  sender_id: uuid"),
        (False, "FK  recipient_id: uuid"),
        (False, "    message_type: varchar(20)"),
        (False, "    content: text"),
        (False, "    is_read: boolean"),
        (False, "    sent_at: timestamp"),
        (False, "    read_at: timestamp")
    ])

    create_table("t_payments", "PAYMENTS", 1220, 300, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  passenger_id: uuid"),
        (False, "    amount: decimal(12,2)"),
        (False, "    currency: varchar(5)"),
        (False, "    payment_method: varchar(20)"),
        (False, "    gateway_provider: varchar(30)"),
        (False, "UQ  transaction_ref: varchar(100)"),
        (False, "    payment_payload_json: jsonb"),
        (False, "    status: varchar(20)"),
        (False, "    verified_at: timestamp"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_wallets", "DRIVER_WALLETS", 1220, 610, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    total_earned: decimal(14,2)"),
        (False, "    available_balance: decimal(14,2)"),
        (False, "    pending_balance: decimal(14,2)"),
        (False, "    currency: varchar(5)"),
        (False, "    updated_at: timestamp")
    ])

    create_table("t_payouts", "DRIVER_PAYOUTS", 1220, 830, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  wallet_id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    amount: decimal(12,2)"),
        (False, "    payout_channel: varchar(30)"),
        (False, "    account_number: varchar(50)"),
        (False, "UQ  transaction_ref: varchar(100)"),
        (False, "    status: varchar(20)"),
        (False, "    requested_at: timestamp"),
        (False, "    processed_at: timestamp")
    ])

    add_edge(root, "er_1", "1 to N", edge_erd, "t_users", "t_favs", exit_xy=(0.5, 1), entry_xy=(0.5, 0))
    add_edge(root, "er_2", "1 to N", edge_erd, "t_users", "t_guardians", exit_xy=(0.3, 1), entry_xy=(0.3, 0))
    add_edge(root, "er_3", "1 to 1", edge_erd, "t_users", "t_drivers", exit_xy=(1, 0.2), entry_xy=(0, 0.2))
    add_edge(root, "er_4", "1 to N", edge_erd, "t_users", "t_rides", exit_xy=(1, 0.4), entry_xy=(0, 0.2))
    add_edge(root, "er_5", "1 to N", edge_erd, "t_users", "t_chat", exit_xy=(1, 0.6), entry_xy=(0, 0.2))
    add_edge(root, "er_6", "1 to N", edge_erd, "t_users", "t_payments", exit_xy=(1, 0.8), entry_xy=(0, 0.2))

    add_edge(root, "er_7", "1 to N", edge_erd, "t_drivers", "t_vehicles", exit_xy=(0.5, 1), entry_xy=(0.5, 0))
    add_edge(root, "er_8", "1 to N", edge_erd, "t_drivers", "t_status_logs", exit_xy=(0.3, 1), entry_xy=(0.3, 0))
    add_edge(root, "er_9", "1 to N", edge_erd, "t_drivers", "t_rides", exit_xy=(1, 0.3), entry_xy=(0, 0.3))
    add_edge(root, "er_10", "1 to N", edge_erd, "t_drivers", "t_dispatches", exit_xy=(1, 0.6), entry_xy=(0, 0.3))
    add_edge(root, "er_11", "1 to 1", edge_erd, "t_drivers", "t_wallets", exit_xy=(1, 0.8), entry_xy=(0, 0.2))
    add_edge(root, "er_12", "1 to N", edge_erd, "t_drivers", "t_payouts", exit_xy=(1, 0.9), entry_xy=(0, 0.2))
    add_edge(root, "er_13", "1 to N", edge_erd, "t_drivers", "t_gps_logs", exit_xy=(0.7, 1), entry_xy=(0.7, 0))

    add_edge(root, "er_14", "1 to N", edge_erd, "t_rides", "t_waypoints", exit_xy=(0.5, 1), entry_xy=(0.5, 0))
    add_edge(root, "er_15", "1 to N", edge_erd, "t_rides", "t_dispatches", exit_xy=(0.3, 1), entry_xy=(0.3, 0))
    add_edge(root, "er_16", "1 to N", edge_erd, "t_rides", "t_chat", exit_xy=(1, 0.2), entry_xy=(0, 0.5))
    add_edge(root, "er_17", "1 to N", edge_erd, "t_rides", "t_gps_logs", exit_xy=(0, 0.8), entry_xy=(1, 0.5))
    add_edge(root, "er_18", "1 to N", edge_erd, "t_rides", "t_cctv", exit_xy=(0.7, 1), entry_xy=(0.7, 0))
    add_edge(root, "er_19", "1 to N", edge_erd, "t_rides", "t_safety_alerts", exit_xy=(0, 0.9), entry_xy=(1, 0.5))
    add_edge(root, "er_20", "1 to 1", edge_erd, "t_rides", "t_payments", exit_xy=(1, 0.5), entry_xy=(0, 0.5))

    add_edge(root, "er_21", "1 to N", edge_erd, "t_wallets", "t_payouts", exit_xy=(0.5, 1), entry_xy=(0.5, 0))


# =============================================================================
# TAB 4: COMPONENT ARCHITECTURE
# =============================================================================
def build_component_tab(root):
    c_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    sub_style = "swimlane;whiteSpace=wrap;html=1;fillColor=#FAFAFA;strokeColor=#000000;strokeWidth=2;fontColor=#000000;startSize=26;horizontal=1;fontStyle=1;fontSize=12;"
    data_style = "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=10;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    edge_c = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "tier_1", "<b>1. Client Tier (Native iOS Swift & Android Kotlin)</b>", sub_style, 50, 40, 1500, 160)
    add_cell(root, "cp_app_p", "<b>Passenger Native App</b>\n- Core App Shell & Booking UI\n- Dynamic Plugin Manager\n- Deep-Link Payment Handler", c_style, 90, 80, 360, 90, parent="tier_1")
    add_cell(root, "cp_app_d", "<b>Driver Native App</b>\n- Digital Meter & Turn-by-Turn\n- CameraX / AVFoundation CCTV\n- High-Frequency GPS Streamer", c_style, 610, 80, 380, 90, parent="tier_1")
    add_cell(root, "cp_app_g", "<b>Guardian Safety Plugin Package</b>\n- On-Demand Installable Module\n- Live Family Telemetry Streamer\n- Cross-Track Deviation Alarm", c_style, 1130, 80, 360, 90, parent="tier_1")

    add_cell(root, "tier_2", "<b>2. Edge & API Gateway Tier</b>", sub_style, 50, 240, 1500, 130)
    add_cell(root, "cp_gw", "<b>Go API Gateway & Reverse Proxy</b>\n- TLS 1.3 Termination | JWT Auth Claims | Rate Limiting | WebSocket Connection Multiplexing", c_style, 90, 280, 1420, 65, parent="tier_2")

    add_cell(root, "tier_3", "<b>3. Go Backend Core Application Tier (Clean Architecture)</b>", sub_style, 50, 410, 1500, 240)
    add_cell(root, "cp_s_auth", "<b>Auth & User Service</b>\n- Profiles & Drivers\n- Family Guardians", c_style, 90, 460, 240, 80, parent="tier_3")
    add_cell(root, "cp_s_disp", "<b>Dispatch Engine</b>\n- Multi-Stop Fare Calc\n- Spatial Matchmaker\n- 15s Cascading Pool", c_style, 370, 460, 260, 80, parent="tier_3")
    add_cell(root, "cp_s_rt", "<b>Real-Time & Telemetry Hub</b>\n- WebSocket Hub\n- In-App Chat Router\n- GPS Stream Worker", c_style, 670, 460, 260, 80, parent="tier_3")
    add_cell(root, "cp_s_safe", "<b>Safety & Plugin Hub</b>\n- Deviation Engine\n- Plugin Manifest CDN\n- SHA-256 Cloud Vault", c_style, 970, 460, 260, 80, parent="tier_3")
    add_cell(root, "cp_s_bill", "<b>Payment & Wallet Service</b>\n- KBZPay/AYAPay Handler\n- Webhook HMAC Verifier\n- Driver Wallet Ledger", c_style, 1270, 460, 240, 80, parent="tier_3")

    add_cell(root, "tier_4", "<b>4. Persistence, Cache & Storage Tier</b>", sub_style, 50, 690, 1500, 160)
    add_cell(root, "cp_db", "<b>PostgreSQL 16 + PostGIS</b>\n- Master Relational Schema\n- Spatial Query Indexes (GIST)\n- Double-Entry Wallet Ledger", data_style, 130, 730, 360, 95, parent="tier_4")
    add_cell(root, "cp_cache", "<b>Redis 7 Cluster</b>\n- Spatial Index (GEOADD/GEORADIUS)\n- Pub/Sub Telemetry Broker\n- Distributed Locks (Redlock)", data_style, 610, 730, 380, 95, parent="tier_4")
    add_cell(root, "cp_s3", "<b>Encrypted S3 Media Vault</b>\n- CCTV Video Chunks & Digests\n- Dynamic Plugin Split Modules\n- Digital Payment Receipts", data_style, 1130, 730, 360, 95, parent="tier_4")

    add_cell(root, "tier_5", "<b>5. External Integrations Tier</b>", sub_style, 50, 890, 1500, 140)
    add_cell(root, "cp_ext_map", "<b>Routing Engine</b>\n(OSRM / Mapbox)", c_style, 130, 940, 360, 60, parent="tier_5")
    add_cell(root, "cp_ext_pay", "<b>Payment Gateways</b>\n(KBZPay / AYAPay / Wave)", c_style, 610, 940, 380, 60, parent="tier_5")
    add_cell(root, "cp_ext_push", "<b>Push Notifications</b>\n(Apple APNs / Google FCM)", c_style, 1130, 940, 360, 60, parent="tier_5")

    add_edge(root, "ce_1", "HTTPS / WSS", edge_c, "cp_app_p", "cp_gw", exit_xy=(0.5, 1), entry_xy=(0.15, 0))
    add_edge(root, "ce_2", "HTTPS / WSS / gRPC", edge_c, "cp_app_d", "cp_gw", exit_xy=(0.5, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_3", "Dynamic Sync", edge_c, "cp_app_g", "cp_gw", exit_xy=(0.5, 1), entry_xy=(0.85, 0))

    add_edge(root, "ce_4", "", edge_c, "cp_gw", "cp_s_auth", exit_xy=(0.1, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_5", "", edge_c, "cp_gw", "cp_s_disp", exit_xy=(0.3, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_6", "", edge_c, "cp_gw", "cp_s_rt", exit_xy=(0.5, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_7", "", edge_c, "cp_gw", "cp_s_safe", exit_xy=(0.7, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_8", "", edge_c, "cp_gw", "cp_s_bill", exit_xy=(0.9, 1), entry_xy=(0.5, 0))

    add_edge(root, "ce_9", "Persist Master", edge_c, "cp_s_auth", "cp_db", exit_xy=(0.5, 1), entry_xy=(0.3, 0))
    add_edge(root, "ce_10", "Spatial Match", edge_c, "cp_s_disp", "cp_cache", exit_xy=(0.5, 1), entry_xy=(0.3, 0))
    add_edge(root, "ce_11", "Stream Coords", edge_c, "cp_s_rt", "cp_cache", exit_xy=(0.5, 1), entry_xy=(0.7, 0))
    add_edge(root, "ce_12", "Vault CCTV & Plugins", edge_c, "cp_s_safe", "cp_s3", exit_xy=(0.5, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_13", "Atomic Ledger", edge_c, "cp_s_bill", "cp_db", exit_xy=(0.5, 1), entry_xy=(0.8, 0))

    add_edge(root, "ce_14", "Routing Polyline", edge_c, "cp_s_disp", "cp_ext_map", exit_xy=(0.2, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_15", "Webhook / PreOrder", edge_c, "cp_s_bill", "cp_ext_pay", exit_xy=(0.8, 1), entry_xy=(0.5, 0))
    add_edge(root, "ce_16", "Emergency Push", edge_c, "cp_s_safe", "cp_ext_push", exit_xy=(0.8, 1), entry_xy=(0.5, 0))


# =============================================================================
# TAB 5: CLASS & DOMAIN ARCHITECTURE
# =============================================================================
def build_class_tab(root):
    cls_box = "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    cls_member = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#000000;fontSize=10;"
    cls_div = "line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;"
    edge_a = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;endArrow=open;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"
    edge_i = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;dashed=1;endArrow=block;endFill=0;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    def create_class(cid, title, x, y, width, attrs, methods):
        total_rows = len(attrs) + (1 if methods else 0) + len(methods)
        h = 26 + total_rows * 18
        add_cell(root, cid, f"<b>{title}</b>", cls_box, x, y, width, h)
        idx = 0
        for a in attrs:
            add_cell(root, f"{cid}_a{idx}", a, cls_member, 0, 26 + idx * 18, width, 18, parent=cid)
            idx += 1
        if methods:
            add_cell(root, f"{cid}_div", "", cls_div, 0, 26 + idx * 18, width, 4, parent=cid)
            idx += 1
            for m in methods:
                add_cell(root, f"{cid}_m{idx}", m, cls_member, 0, 26 + idx * 18, width, 18, parent=cid)
                idx += 1

    create_class("cl_user", "User", 50, 40, 260, [
        "+ ID: UUID", "+ PhoneNumber: string", "+ FullName: string", "+ Role: UserRole"
    ], ["+ GetGuardians(): []User", "+ AddFavorite(loc): error"])

    create_class("cl_driver", "Driver", 360, 40, 260, [
        "+ ID: UUID", "+ UserID: UUID", "+ Status: DriverStatus", "+ Rating: float64"
    ], ["+ IsAvailable(): bool", "+ UpdateStatus(s): error"])

    create_class("cl_ride", "Ride", 670, 40, 280, [
        "+ ID: UUID", "+ PassengerID: UUID", "+ DriverID: *UUID", "+ Status: RideStatus",
        "+ Pickup: GeoPoint", "+ FinalDest: GeoPoint", "+ EstimatedFare: Money"
    ], ["+ AddWaypoint(p): error", "+ StartTrip(): error", "+ CompleteTrip(): error"])

    create_class("cl_safety", "SafetySession", 1000, 40, 260, [
        "+ RideID: UUID", "+ GuardianActive: bool", "+ CCTVActive: bool"
    ], ["+ CheckDeviation(pt): bool", "+ StreamChunk(c): error"])

    create_class("cl_wallet", "DriverWallet", 1310, 40, 240, [
        "+ DriverID: UUID", "+ Balance: Money", "+ Pending: Money"
    ], ["+ Credit(m): error", "+ RequestPayout(m): error"])

    create_class("if_ride_uc", "&lt;&lt;interface&gt;&gt;\nRideUseCase", 50, 300, 290, [], [
        "+ RequestRide(ctx, req): (Ride, error)",
        "+ DispatchNextDriver(ctx, rideID): error",
        "+ AcceptRide(ctx, rideID, driverID): error",
        "+ CompleteRide(ctx, rideID): error"
    ])

    create_class("if_safety_uc", "&lt;&lt;interface&gt;&gt;\nSafetyUseCase", 390, 300, 290, [], [
        "+ ActivateGuardian(ctx, rideID): error",
        "+ StreamGPS(ctx, rideID, pt): error",
        "+ StartProtectingCCTV(ctx, rideID): error",
        "+ DeactivateSafety(ctx, rideID): error"
    ])

    create_class("if_pay_uc", "&lt;&lt;interface&gt;&gt;\nPaymentUseCase", 730, 300, 290, [], [
        "+ InitiateCashless(ctx, req): (DeepLink, error)",
        "+ HandleWebhook(ctx, sig, body): error",
        "+ ConfirmCash(ctx, rideID): error",
        "+ DisbursePayout(ctx, driverID, m): error"
    ])

    create_class("if_chat_uc", "&lt;&lt;interface&gt;&gt;\nChatUseCase", 1070, 300, 270, [], [
        "+ SendMessage(ctx, msg): error",
        "+ GetChatHistory(ctx, rideID): ([]Msg, error)",
        "+ CloseChatSession(ctx, rideID): error"
    ])

    create_class("vm_pass", "PassengerViewModel\n(Native iOS/Android)", 50, 540, 290, [
        "+ CurrentRideState: State", "+ EstimatedFare: Fare"
    ], ["+ CallTaxi()", "+ SelectPayment(m)", "+ SendChat(msg)"])

    create_class("vm_driv", "DriverViewModel\n(Native iOS/Android)", 390, 540, 290, [
        "+ Status: DriverStatus", "+ CurrentOffer: Offer"
    ], ["+ ToggleStatus(s)", "+ AcceptBooking()", "+ TransferSales()"])

    create_class("vm_cctv_m", "NativeCCTVManager\n(AVFoundation / CameraX)", 730, 540, 290, [
        "+ CaptureSession: Session", "+ GPSLogger: Logger"
    ], ["+ StartRecording()", "+ StreamEncryptedChunks()", "+ Stop()"])

    create_class("vm_guard", "GuardianPluginPackage\n(Dynamic Modular Framework)", 1070, 540, 270, [
        "+ PluginVersion: string", "+ IsInstalled: bool"
    ], ["+ InstallOnDemand()", "+ StreamFamilyLive()", "+ TriggerSOS()"])

    add_edge(root, "cla_1", "1 to N", edge_a, "cl_user", "cl_ride", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "cla_2", "1 to N", edge_a, "cl_driver", "cl_ride", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "cla_3", "1 to 1", edge_a, "cl_ride", "cl_safety", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "cla_4", "1 to 1", edge_a, "cl_driver", "cl_wallet", exit_xy=(1, 0.8), entry_xy=(0, 0.5))

    add_edge(root, "cli_1", "calls", edge_i, "vm_pass", "if_ride_uc", exit_xy=(0.5, 0), entry_xy=(0.5, 1))
    add_edge(root, "cli_2", "calls", edge_i, "vm_driv", "if_ride_uc", exit_xy=(0.5, 0), entry_xy=(0.5, 1))
    add_edge(root, "cli_3", "controls", edge_a, "vm_driv", "vm_cctv_m", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "cli_4", "syncs", edge_i, "vm_cctv_m", "if_safety_uc", exit_xy=(0.5, 0), entry_xy=(0.5, 1))
    add_edge(root, "cli_5", "dynamic bind", edge_i, "vm_guard", "if_safety_uc", exit_xy=(0.5, 0), entry_xy=(0.9, 1))


# =============================================================================
# TAB 6: SEQUENCE DIAGRAM - DISPATCH & CHAT
# =============================================================================
def build_seq_dispatch_tab(root):
    ll_style = "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    edge_m = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;endArrow=classic;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"
    edge_r = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;dashed=1;endArrow=open;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "sq_p", "Passenger App\n(Native)", ll_style, 60, 40, 150, 800)
    add_cell(root, "sq_gw", "Go API Gateway\n& Reverse Proxy", ll_style, 270, 40, 150, 800)
    add_cell(root, "sq_disp", "Go Dispatch\nEngine", ll_style, 480, 40, 150, 800)
    add_cell(root, "sq_redis", "Redis Cluster\n(Spatial/PubSub)", ll_style, 690, 40, 150, 800)
    add_cell(root, "sq_chat", "Go WebSocket\nChat Service", ll_style, 900, 40, 150, 800)
    add_cell(root, "sq_dr1", "Driver 1\n(Candidate)", ll_style, 1110, 40, 150, 800)
    add_cell(root, "sq_dr2", "Driver 2\n(Assigned)", ll_style, 1320, 40, 150, 800)

    add_edge(root, "sm_1", "1. POST /estimate (Pickup, Dest, Stops)", edge_m, "sq_p", "sq_gw")
    add_edge(root, "sm_2", "2. Return Estimated Fare & Polyline", edge_r, "sq_gw", "sq_p")
    add_edge(root, "sm_3", "3. POST /rides/request ('Call Now')", edge_m, "sq_p", "sq_gw")
    add_edge(root, "sm_4", "4. CreateRideOrder(SEARCHING)", edge_m, "sq_gw", "sq_disp")
    add_edge(root, "sm_5", "5. GEORADIUS 3km nearby drivers", edge_m, "sq_disp", "sq_redis")
    add_edge(root, "sm_6", "6. Ranked Drivers: [Driver1, Driver2]", edge_r, "sq_redis", "sq_disp")
    add_edge(root, "sm_7", "7. Push Offer (15s Countdown)", edge_m, "sq_disp", "sq_dr1")
    add_edge(root, "sm_8", "8. Driver 1 Rejects / Timeout", edge_r, "sq_dr1", "sq_disp")
    add_edge(root, "sm_9", "9. Cascade Offer to Driver 2", edge_m, "sq_disp", "sq_dr2")
    add_edge(root, "sm_10", "10. Driver 2 Accepts Ride", edge_m, "sq_dr2", "sq_disp")
    add_edge(root, "sm_11", "11. Push: Driver Assigned & ETA", edge_m, "sq_disp", "sq_p")
    add_edge(root, "sm_12", "12. Open WebSocket Room", edge_m, "sq_disp", "sq_chat")
    add_edge(root, "sm_13", "13. Send Message ('Near gate')", edge_m, "sq_p", "sq_chat")
    add_edge(root, "sm_14", "14. Deliver Message ('Near gate')", edge_m, "sq_chat", "sq_dr2")
    add_edge(root, "sm_15", "15. Driver Arrived Pickup -> Close Chat", edge_m, "sq_dr2", "sq_gw")


# =============================================================================
# TAB 7: SEQUENCE DIAGRAM - DUAL SAFETY & CCTV
# =============================================================================
def build_seq_safety_tab(root):
    ll_style = "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    edge_m = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;endArrow=classic;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"
    edge_r = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;dashed=1;endArrow=open;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "sqs_dr", "Driver App\n(CCTV & GPS)", ll_style, 60, 40, 150, 800)
    add_cell(root, "sqs_p", "Passenger App\n(Native)", ll_style, 270, 40, 150, 800)
    add_cell(root, "sqs_gw", "Go API Gateway\n& Router", ll_style, 480, 40, 150, 800)
    add_cell(root, "sqs_safe", "Go Safety & Telemetry\nEngine", ll_style, 690, 40, 160, 800)
    add_cell(root, "sqs_dev", "Geofence Deviation\nChecker", ll_style, 910, 40, 150, 800)
    add_cell(root, "sqs_s3", "Encrypted S3\nCloud Vault", ll_style, 1120, 40, 150, 800)
    add_cell(root, "sqs_g", "Guardian App\n(Family Shield)", ll_style, 1330, 40, 150, 800)

    add_edge(root, "sms_1", "1. POST /rides/{id}/start-ride", edge_m, "sqs_dr", "sqs_gw")
    add_edge(root, "sms_2", "2. ActivateRideSafety(rideID)", edge_m, "sqs_gw", "sqs_safe")
    add_edge(root, "sms_3", "3. Push: 'Family Ride Started' & Driver Info", edge_m, "sqs_safe", "sqs_g")
    add_edge(root, "sms_4", "4. Start In-Car CCTV Video Recording", edge_m, "sqs_safe", "sqs_dr")
    add_edge(root, "sms_5", "5. Stream Telemetry (lat, lng, speed)", edge_m, "sqs_dr", "sqs_safe")
    add_edge(root, "sms_6", "6. Stream Live Location to Family Map", edge_m, "sqs_safe", "sqs_g")
    add_edge(root, "sms_7", "7. CheckDeviation(currentPt, polyline)", edge_m, "sqs_safe", "sqs_dev")
    add_edge(root, "sms_8", "8. Anomaly Detected (d_xt > 300m for >45s)", edge_r, "sqs_dev", "sqs_safe")
    add_edge(root, "sms_9", "9. CRITICAL ALERT: Off-Route Warning", edge_m, "sqs_safe", "sqs_g")
    add_edge(root, "sms_10", "10. Upload Encrypted CCTV Chunk (60s)", edge_m, "sqs_dr", "sqs_s3")
    add_edge(root, "sms_11", "11. Destination Reached -> POST /arrive", edge_m, "sqs_dr", "sqs_gw")
    add_edge(root, "sms_12", "12. Display Final Calculated Fare", edge_r, "sqs_gw", "sqs_p")


# =============================================================================
# TAB 8: SEQUENCE DIAGRAM - PAYMENT & PAYOUT
# =============================================================================
def build_seq_payment_tab(root):
    ll_style = "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    edge_m = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;endArrow=classic;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"
    edge_r = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;dashed=1;endArrow=open;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "sqp_p", "Passenger App\n(Native)", ll_style, 60, 40, 150, 800)
    add_cell(root, "sqp_dr", "Driver App\n(Native)", ll_style, 270, 40, 150, 800)
    add_cell(root, "sqp_gw", "Go API Gateway\n& Router", ll_style, 480, 40, 150, 800)
    add_cell(root, "sqp_pay", "Go Payment & Wallet\nService", ll_style, 690, 40, 160, 800)
    add_cell(root, "sqp_wallet", "E-Wallet App\n(KPay/AYAPay)", ll_style, 910, 40, 150, 800)
    add_cell(root, "sqp_bank", "Payment Gateway\nWebhook Server", ll_style, 1120, 40, 150, 800)
    add_cell(root, "sqp_g", "Guardian App\n(Family Shield)", ll_style, 1330, 40, 150, 800)

    add_edge(root, "smp_1", "1. POST /payments/initiate-cashless", edge_m, "sqp_p", "sqp_gw")
    add_edge(root, "smp_2", "2. CreatePreOrder(amount, orderID)", edge_m, "sqp_gw", "sqp_pay")
    add_edge(root, "smp_3", "3. Return DeepLink ('kbzpay://pay?...')", edge_r, "sqp_pay", "sqp_p")
    add_edge(root, "smp_4", "4. OS Deep-Link Jump to Wallet", edge_m, "sqp_p", "sqp_wallet")
    add_edge(root, "smp_5", "5. Authorize PIN / Biometrics", edge_m, "sqp_wallet", "sqp_bank")
    add_edge(root, "smp_6", "6. Webhook Callback (HMAC Signature)", edge_m, "sqp_bank", "sqp_pay")
    add_edge(root, "smp_7", "7. Deep-Link Jump Back to Taxi App", edge_m, "sqp_wallet", "sqp_p")
    add_edge(root, "smp_8", "8. Credit Driver Wallet Balance", edge_m, "sqp_pay", "sqp_dr")
    add_edge(root, "smp_9", "9. Push: 'Safely Arrived' & Deactivate", edge_m, "sqp_pay", "sqp_g")
    add_edge(root, "smp_10", "10. GET /drivers/sales/today", edge_m, "sqp_dr", "sqp_pay")
    add_edge(root, "smp_11", "11. Return Sales Summary & Earnings", edge_r, "sqp_pay", "sqp_dr")
    add_edge(root, "smp_12", "12. POST /drivers/wallet/transfer", edge_m, "sqp_dr", "sqp_pay")
    add_edge(root, "smp_13", "13. Disburse Funds via Gateway API", edge_m, "sqp_pay", "sqp_bank")
    add_edge(root, "smp_14", "14. Payout Success & Balance Updated", edge_r, "sqp_pay", "sqp_dr")


# =============================================================================
# TAB 9: STATE MACHINE - RIDE LIFECYCLE
# =============================================================================
def build_state_ride_tab(root):
    state_style = "rounded=1;arcSize=20;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    start_pt = "ellipse;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;"
    edge_st = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "st_s", "", start_pt, 60, 100, 30, 30)
    add_cell(root, "st_draft", "<b>DRAFT</b>\nSelecting stops & fare preview", state_style, 140, 80, 210, 65)
    add_cell(root, "st_search", "<b>SEARCHING</b>\nEvaluating nearest drivers", state_style, 420, 80, 210, 65)
    add_cell(root, "st_disp", "<b>DISPATCHED</b>\n15s Offer countdown timer", state_style, 700, 80, 210, 65)
    add_cell(root, "st_acc", "<b>ACCEPTED / ARRIVING</b>\nEn route to pickup & chat open", state_style, 980, 80, 220, 65)
    add_cell(root, "st_pickup", "<b>ARRIVED_AT_PICKUP</b>\nChat closed / boarding taxi", state_style, 980, 220, 220, 65)
    add_cell(root, "st_transit", "<b>IN_TRANSIT</b>\nGuardian Live & CCTV Active", state_style, 700, 220, 210, 65)
    add_cell(root, "st_dest", "<b>ARRIVED_DESTINATION</b>\nFinal fare computed & shown", state_style, 420, 220, 210, 65)
    add_cell(root, "st_pay", "<b>PAYMENT_PROCESSING</b>\nCash / Cashless verification", state_style, 140, 220, 210, 65)
    add_cell(root, "st_comp", "<b>COMPLETED</b>\nSafety teardown & receipts", state_style, 140, 360, 210, 65)
    add_cell(root, "st_e", "", start_pt, 420, 375, 30, 30)

    add_edge(root, "ste_1", "Open Screen", edge_st, "st_s", "st_draft")
    add_edge(root, "ste_2", "Tap 'Call Now'", edge_st, "st_draft", "st_search")
    add_edge(root, "ste_3", "Candidate Found", edge_st, "st_search", "st_disp")
    add_edge(root, "ste_4", "Reject / Timeout", edge_st, "st_disp", "st_search", exit_xy=(0.5, 0), entry_xy=(0.5, 0))
    add_edge(root, "ste_5", "Driver Accepts", edge_st, "st_disp", "st_acc")
    add_edge(root, "ste_6", "Arrive Pickup", edge_st, "st_acc", "st_pickup")
    add_edge(root, "ste_7", "Start Ride", edge_st, "st_pickup", "st_transit")
    add_edge(root, "ste_8", "Arrive Destination", edge_st, "st_transit", "st_dest")
    add_edge(root, "ste_9", "Select Method", edge_st, "st_dest", "st_pay")
    add_edge(root, "ste_10", "Payment Confirmed", edge_st, "st_pay", "st_comp")
    add_edge(root, "ste_11", "Archive Trip", edge_st, "st_comp", "st_e")


# =============================================================================
# TAB 10: STATE MACHINE - DRIVER STATUS & SHIFTS
# =============================================================================
def build_state_driver_tab(root):
    state_style = "rounded=1;arcSize=20;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    start_pt = "ellipse;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;"
    edge_st = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    add_cell(root, "sd_s", "", start_pt, 60, 100, 30, 30)
    add_cell(root, "sd_off", "<b>OFFLINE</b>\nLogged out / Shift closed", state_style, 140, 80, 210, 65)
    add_cell(root, "sd_avail", "<b>AVAILABLE</b>\nStreaming GPS & Ready for Rides", state_style, 420, 80, 230, 65)
    add_cell(root, "sd_break", "<b>BREAK_TIME</b>\nToggled pause on dispatch", state_style, 730, 80, 210, 65)
    add_cell(root, "sd_duty", "<b>ON_ANOTHER_DUTY</b>\nOff-platform task engaged", state_style, 730, 180, 210, 65)
    add_cell(root, "sd_offer", "<b>OFFER_RECEIVED</b>\n15s Countdown Decision", state_style, 420, 220, 230, 65)
    add_cell(root, "sd_enroute", "<b>HEADING_TO_PICKUP</b>\nChat & Navigation Active", state_style, 140, 220, 210, 65)
    add_cell(root, "sd_trip", "<b>ON_TRIP_PROTECTED</b>\nCCTV Recording & GPS Logging", state_style, 140, 340, 210, 65)
    add_cell(root, "sd_sales", "<b>SALES_SUMMARY</b>\nViewing orders & balance", state_style, 420, 340, 230, 65)
    add_cell(root, "sd_transfer", "<b>TRANSFER_SALES</b>\nPayout to E-Wallet", state_style, 730, 340, 210, 65)

    add_edge(root, "sde_1", "Driver Login", edge_st, "sd_s", "sd_off")
    add_edge(root, "sde_2", "Start Shift", edge_st, "sd_off", "sd_avail")
    add_edge(root, "sde_3", "Toggle Break", edge_st, "sd_avail", "sd_break")
    add_edge(root, "sde_4", "Resume", edge_st, "sd_break", "sd_avail", exit_xy=(0.5, 0), entry_xy=(0.5, 0))
    add_edge(root, "sde_5", "Toggle Duty", edge_st, "sd_avail", "sd_duty")
    add_edge(root, "sde_6", "Resume", edge_st, "sd_duty", "sd_avail")
    add_edge(root, "sde_7", "Ride Matched", edge_st, "sd_avail", "sd_offer")
    add_edge(root, "sde_8", "Reject/Timeout", edge_st, "sd_offer", "sd_avail")
    add_edge(root, "sde_9", "Accept Offer", edge_st, "sd_offer", "sd_enroute")
    add_edge(root, "sde_10", "Start Ride", edge_st, "sd_enroute", "sd_trip")
    add_edge(root, "sde_11", "Trip Finished", edge_st, "sd_trip", "sd_sales")
    add_edge(root, "sde_12", "Transfer Sales", edge_st, "sd_sales", "sd_transfer")
    add_edge(root, "sde_13", "Payout Done", edge_st, "sd_transfer", "sd_sales")
    add_edge(root, "sde_14", "Return", edge_st, "sd_sales", "sd_avail")


# =============================================================================
# TAB 11: GUARDIAN ON-DEMAND DYNAMIC PLUGIN MODULE ARCHITECTURE
# =============================================================================
def build_guardian_plugin_tab(root):
    c_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    sub_style = "swimlane;whiteSpace=wrap;html=1;fillColor=#FAFAFA;strokeColor=#000000;strokeWidth=2;fontColor=#000000;startSize=26;horizontal=1;fontStyle=1;fontSize=12;"
    plugin_box = "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;strokeDasharray=4 4;fontColor=#000000;startSize=26;horizontal=1;fontStyle=1;fontSize=12;"
    edge_p = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"
    edge_d = "edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;orthogonalLoop=1;html=1;dashed=1;endArrow=open;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontColor=#000000;jumpStyle=arc;jumpSize=6;"

    # 1. Base App Container (Host)
    add_cell(root, "host_app", "<b>Passenger Base Mobile App (Core Host Container)</b>", sub_style, 50, 40, 520, 680)
    add_cell(root, "hp_shell", "<b>Core App Shell & UI Flow</b>\n- Map Booking Interface\n- User Authentication\n- Payment Checkout & Receipts", c_style, 80, 80, 460, 75, parent="host_app")
    add_cell(root, "hp_mgr", "<b>Dynamic Feature Module Manager (PluginLoader)</b>\n- Play Feature Delivery / Dynamic Framework Loader\n- Signature & Hash SHA-256 Verifier\n- On-Demand Split APK / Framework Downloader", c_style, 80, 185, 460, 85, parent="host_app")
    add_cell(root, "hp_bus", "<b>Modular Reactive Event Bus</b>\n- Ride Lifecycle Broadcasts (`ON_RIDE_START`, `ON_ARRIVE`)\n- High-Accuracy Telemetry Channel\n- Push Notification Event Multiplexer", c_style, 80, 300, 460, 85, parent="host_app")
    add_cell(root, "hp_ui_slot", "<b>Dynamic Guardian UI Slot / Tab Anchor</b>\n- Renders 'Download Guardian Plugin (3.8 MB)' when uninstalled\n- Mounts Guardian Live Telemetry Dashboard upon installation", c_style, 80, 415, 460, 85, parent="host_app")
    add_cell(root, "hp_perm", "<b>Plugin Permission Proxy</b>\n- Sandboxed OS Permission Granter\n- High-Priority Alert Channel & Background GPS", c_style, 80, 530, 460, 80, parent="host_app")

    # 2. Guardian Dynamic Plugin Package
    add_cell(root, "plugin_pkg", "<b>Guardian Safety Shield Plugin Package (com.taxi.plugin.guardian / GuardianPluginKit.framework)</b>", plugin_box, 630, 40, 560, 680)
    add_cell(root, "gp_boot", "<b>1. Plugin Entrypoint & Lifecycle Hook</b>\n- `IPluginLifecycle.onInstall()`, `onMount()`, `onUnmount()`\n- Background Service Registration", c_style, 660, 80, 500, 75, parent="plugin_pkg")
    add_cell(root, "gp_mesh", "<b>2. Family Mesh Pairing Engine</b>\n- Dynamic QR Code & 6-Digit One-Time Token Generator\n- Cryptographic Key Exchange for P2P Family Session", c_style, 660, 185, 500, 80, parent="plugin_pkg")
    add_cell(root, "gp_stream", "<b>3. Live Telemetry Stream Renderer</b>\n- WebRTC DataChannel & WebSocket GPS Sub-Receiver\n- Smooth 60fps Vehicle Interpolation on Family Map", c_style, 660, 295, 500, 80, parent="plugin_pkg")
    add_cell(root, "gp_dev", "<b>4. Cross-Track Route Deviation Engine</b>\n- Offline Spherical Polyline Anomaly Detector\n- $d_{xt} > 300\\text{m}$ for $> 45\\text{s}$ Trigger", c_style, 660, 405, 500, 80, parent="plugin_pkg")
    add_cell(root, "gp_sos", "<b>5. Emergency SOS Broadcaster & Alarm</b>\n- Critical Siren & OS 'Do Not Disturb' Override\n- Emergency Contact SMS & Direct Police Dispatch", c_style, 660, 515, 500, 85, parent="plugin_pkg")

    # 3. Go Backend Plugin Hub & Delivery Cloud
    add_cell(root, "backend_hub", "<b>Go Backend Plugin Distribution & Dynamic Sync Tier</b>", sub_style, 1250, 40, 520, 680)
    add_cell(root, "bp_reg", "<b>Plugin Registry & Manifest Service</b>\n- Plugin Version Matrix & Dynamic Capability Negotiation\n- Signed Module Hash Whitelist", c_style, 1280, 80, 460, 75, parent="backend_hub")
    add_cell(root, "bp_cdn", "<b>Dynamic Delivery CDN / S3 Storage</b>\n- Encrypted Dynamic Split Packages (Android AAB / iOS Framework)\n- Edge Caching & Resumable Chunk Downloads", c_style, 1280, 185, 460, 85, parent="backend_hub")
    add_cell(root, "bp_mesh_hub", "<b>Family Mesh Pairing & Signaling Hub</b>\n- OTP Pairing Token Verification & Redis Session Cache\n- WebRTC Signaling & Telemetry Broadcast Router", c_style, 1280, 300, 460, 85, parent="backend_hub")
    add_cell(root, "bp_alert_hub", "<b>Emergency Alert & Anomaly Dispatcher</b>\n- High-Priority APNs/FCM Push with Siren Payload\n- SMS Gateway Fallback (Twilio / Local Telco)", c_style, 1280, 415, 460, 85, parent="backend_hub")
    add_cell(root, "bp_audit", "<b>Guardian Safety Audit & Incident Vault</b>\n- Immutable Telemetry Log Archive (PostgreSQL + S3)\n- Law Enforcement Export Engine", c_style, 1280, 530, 460, 80, parent="backend_hub")

    # 4. Installation & Runtime Connections
    add_edge(root, "pe_1", "1. Query Available Plugins", edge_p, "hp_mgr", "bp_reg", exit_xy=(1, 0.3), entry_xy=(0, 0.3))
    add_edge(root, "pe_2", "2. Download Dynamic Module", edge_p, "hp_mgr", "bp_cdn", exit_xy=(1, 0.7), entry_xy=(0, 0.5))
    add_edge(root, "pe_3", "3. Dynamic Split Injection", edge_d, "bp_cdn", "gp_boot", exit_xy=(0, 0.8), entry_xy=(1, 0.5))
    add_edge(root, "pe_4", "4. Mount Plugin Lifecycle", edge_p, "gp_boot", "hp_mgr", exit_xy=(0, 0.5), entry_xy=(1, 0.5))
    add_edge(root, "pe_5", "5. Bind UI to Slot", edge_p, "gp_stream", "hp_ui_slot", exit_xy=(0, 0.5), entry_xy=(1, 0.5))
    add_edge(root, "pe_6", "6. Relay Ride Events", edge_p, "hp_bus", "gp_dev", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "pe_7", "7. Pairing Handshake", edge_p, "gp_mesh", "bp_mesh_hub", exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    add_edge(root, "pe_8", "8. Trigger Critical Alert", edge_p, "gp_sos", "bp_alert_hub", exit_xy=(1, 0.5), entry_xy=(0, 0.5))


# =============================================================================
# EXPORT ALL ENGINES
# =============================================================================
def generate_all():
    mxfile = create_mxfile()
    
    tabs = [
        ("01_Use_Case_Model", build_use_case_tab, 1800, 1300),
        ("02_System_Process_Flowchart", build_flowchart_tab, 2100, 1600),
        ("03_Database_ERD_Schema", build_erd_tab, 1600, 1300),
        ("04_Component_Architecture", build_component_tab, 1650, 1100),
        ("05_Class_Domain_Architecture", build_class_tab, 1650, 1000),
        ("06_Sequence_Dispatch_Chat", build_seq_dispatch_tab, 1550, 900),
        ("07_Sequence_Safety_Guardian_CCTV", build_seq_safety_tab, 1550, 900),
        ("08_Sequence_Payment_Payout", build_seq_payment_tab, 1550, 900),
        ("09_State_Machine_Ride_Lifecycle", build_state_ride_tab, 1300, 800),
        ("10_State_Machine_Driver_Status", build_state_driver_tab, 1100, 800),
        ("11_Guardian_Plugin_Module_Architecture", build_guardian_plugin_tab, 1850, 800),
    ]

    for idx, (tname, tfn, tw, th) in enumerate(tabs):
        r = add_diagram_tab(mxfile, f"tab_{idx+1}", tname, tw, th)
        tfn(r)

    xml_str = ET.tostring(mxfile, encoding="utf-8")
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent="  ")
    cleaned_lines = [line for line in pretty_xml.split("\n") if line.strip()]
    final_xml = "\n".join(cleaned_lines)

    master_path_root = os.path.join(ROOT_OUTPUT, "taxi_master_architecture.drawio")
    master_path_drawio = os.path.join(OUTPUT_DIR, "taxi_master_architecture.drawio")
    master_path_drawio_all = os.path.join(OUTPUT_DIR, "taxi_master_all_in_one.drawio")
    
    for p in [master_path_root, master_path_drawio, master_path_drawio_all]:
        with open(p, "w", encoding="utf-8") as f:
            f.write(final_xml)
        print(f"Master file saved: {p}")

    standalone_files = [
        ("01_use_case_diagram.drawio", build_use_case_tab, "UML 2.5 Use Case Model", 1800, 1300),
        ("02_system_process_flowchart.drawio", build_flowchart_tab, "System Process Flowchart", 2100, 1600),
        ("03_database_erd_schema.drawio", build_erd_tab, "Database ERD Schema", 1600, 1300),
        ("04_component_architecture.drawio", build_component_tab, "Component Architecture", 1650, 1100),
        ("05_class_domain_architecture.drawio", build_class_tab, "Class & Domain Architecture", 1650, 1000),
        ("06_sequence_dispatch_chat.drawio", build_seq_dispatch_tab, "Sequence: Dispatch & Chat", 1550, 900),
        ("07_sequence_safety_guardian_cctv.drawio", build_seq_safety_tab, "Sequence: Safety & CCTV", 1550, 900),
        ("08_sequence_payment_and_payout.drawio", build_seq_payment_tab, "Sequence: Payment & Payout", 1550, 900),
        ("09_state_machine_ride_lifecycle.drawio", build_state_ride_tab, "State Machine: Ride Lifecycle", 1300, 800),
        ("10_state_machine_driver_status.drawio", build_state_driver_tab, "State Machine: Driver Status", 1100, 800),
        ("11_guardian_plugin_module_architecture.drawio", build_guardian_plugin_tab, "Guardian Plugin Module Architecture", 1850, 800),
    ]

    for fname, fn, tname, tw, th in standalone_files:
        f_mx = create_mxfile()
        f_r = add_diagram_tab(f_mx, "diag_1", tname, tw, th)
        fn(f_r)
        
        x_str = ET.tostring(f_mx, encoding="utf-8")
        d_dom = minidom.parseString(x_str)
        p_xml = d_dom.toprettyxml(indent="  ")
        c_lines = [l for l in p_xml.split("\n") if l.strip()]
        f_xml = "\n".join(c_lines)
        
        target = os.path.join(OUTPUT_DIR, fname)
        with open(target, "w", encoding="utf-8") as f:
            f.write(f_xml)
        print(f"Standalone file saved: {target}")

if __name__ == "__main__":
    generate_all()
