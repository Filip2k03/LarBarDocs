#!/usr/bin/env python3
"""
Draw.io Diagram Generator for Taxi Application Architecture
Generates UML 2.5 compliant, Black & White styled .drawio XML files
"""

import os
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

OUTPUT_DIR = "/Users/stephanfilip/Yamato_project/Labar/diagrams/drawio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_mxfile():
    mxfile = ET.Element("mxfile", {
        "host": "app.diagrams.net",
        "modified": "2026-08-20T13:45:00.000Z",
        "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "version": "24.7.5",
        "type": "device"
    })
    return mxfile

def add_diagram_tab(mxfile, diagram_id, name, width=2200, height=1600):
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
    geo = ET.SubElement(cell, "mxGeometry", {
        "x": str(x), "y": str(y), "width": str(width), "height": str(height), "as": "geometry"
    })
    return cell

def add_edge(root, edge_id, value, style, source_id, target_id, parent="1", points=None):
    cell = ET.SubElement(root, "mxCell", {
        "id": edge_id,
        "value": value,
        "style": style,
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

# -----------------------------------------------------------------------------
# 1. USE CASE DIAGRAM GENERATOR
# -----------------------------------------------------------------------------
def build_use_case_diagram(root):
    add_cell(root, "sb_1", "<b>Taxi Application Platform Boundary</b>",
             "swimlane;whiteSpace=wrap;html=1;fillColor=#FAFAFA;strokeColor=#000000;strokeWidth=2;strokeDasharray=4 4;fontColor=#000000;startSize=30;horizontal=1;align=center;fontStyle=1;fontSize=14;",
             260, 40, 920, 1020)

    actor_style = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;"
    add_cell(root, "act_passenger", "<b>Passenger</b>\n(Native User App)", actor_style, 60, 200, 60, 100)
    add_cell(root, "act_driver", "<b>Driver</b>\n(Native Driver App)", actor_style, 60, 620, 60, 100)
    add_cell(root, "act_guardian", "<b>Guardian / Family</b>\n(Family Shield Mode)", actor_style, 1260, 200, 60, 100)
    add_cell(root, "act_payment", "<b>Payment Gateway</b>\n(KBZPay / AYAPay)", actor_style, 1260, 620, 60, 100)
    add_cell(root, "act_cloud", "<b>CCTV Cloud Vault</b>\n(Encrypted S3)", actor_style, 1260, 850, 60, 100)

    uc_style = "ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    
    usecases = [
        ("uc_reg", "UC-01: Register / First Login", 300, 80, 200, 50),
        ("uc_profile", "UC-02: Manage User/Driver Profile", 300, 150, 200, 50),
        ("uc_fav", "UC-03: Manage Favorite Locations", 300, 220, 200, 50),
        ("uc_family", "UC-04: Add / Manage Family Members", 300, 290, 200, 50),
        
        ("uc_pickup", "UC-05: Choose Ride Pickup Point\n(Current/Map/Search/Fav)", 560, 80, 220, 55),
        ("uc_dest", "UC-06: Choose Destination Point\n(Current/Map/Search/Fav)", 560, 150, 220, 55),
        ("uc_stops", "UC-07: Add Extra Waypoints/Stops", 860, 150, 210, 55),
        ("uc_fare", "UC-08: Estimate Route & Taxi Fare", 560, 230, 220, 55),
        ("uc_call", "UC-09: Request Taxi (Call Now)", 560, 310, 220, 55),
        ("uc_dispatch", "UC-10: Dispatch to Nearest Driver", 560, 390, 220, 55),
        ("uc_reassign", "UC-11: Cascade to Next Nearest Driver", 860, 390, 220, 55),
        ("uc_chat", "UC-12: In-App Chat (User <-> Driver)", 560, 470, 220, 55),

        ("uc_driver_auth", "UC-13: Driver Login & Shift Toggle\n(Available / Break / Duty)", 300, 580, 220, 55),
        ("uc_accept_reject", "UC-14: Accept / Reject Ride Request", 560, 580, 220, 55),

        ("uc_start_ride", "UC-15: Start Ride & Trip Metering", 560, 670, 220, 55),
        ("uc_guardian", "UC-16: Activate Guardian Live Tracking", 860, 670, 230, 55),
        ("uc_deviation", "UC-17: Detect Route Deviation Alert", 860, 750, 230, 55),
        ("uc_cctv", "UC-18: Protecting Mode: Record CCTV & GPS", 560, 770, 240, 55),
        ("uc_cctv_upload", "UC-19: Stream / Upload CCTV to Cloud Vault", 860, 840, 240, 55),

        ("uc_complete", "UC-20: Arrive at Final Destination", 300, 880, 220, 55),
        ("uc_pay_cash", "UC-21: Settle Cash Payment", 560, 870, 200, 50),
        ("uc_pay_cashless", "UC-22: Pay via E-Wallet (KPay/AYAPay)", 560, 940, 230, 55),
        ("uc_verify_pay", "UC-23: Verify Payment Webhook Signature", 860, 940, 230, 55),
        ("uc_sales_summary", "UC-24: View Daily Orders & Sales Summary", 300, 970, 230, 55),
        ("uc_sales_transfer", "UC-25: Transfer Sales / Driver Payout", 560, 1010, 230, 50),
    ]

    for uid, uval, ux, uy, uw, uh in usecases:
        add_cell(root, uid, uval, uc_style, ux, uy, uw, uh, parent="sb_1")

    edge_actor = "endArrow=none;html=1;strokeColor=#000000;strokeWidth=1.5;"
    add_edge(root, "e_act1", "", edge_actor, "act_passenger", "uc_reg")
    add_edge(root, "e_act2", "", edge_actor, "act_passenger", "uc_profile")
    add_edge(root, "e_act3", "", edge_actor, "act_passenger", "uc_fav")
    add_edge(root, "e_act4", "", edge_actor, "act_passenger", "uc_family")
    add_edge(root, "e_act5", "", edge_actor, "act_passenger", "uc_pickup")
    add_edge(root, "e_act6", "", edge_actor, "act_passenger", "uc_dest")
    add_edge(root, "e_act7", "", edge_actor, "act_passenger", "uc_call")
    add_edge(root, "e_act8", "", edge_actor, "act_passenger", "uc_chat")
    add_edge(root, "e_act9", "", edge_actor, "act_passenger", "uc_pay_cash")
    add_edge(root, "e_act10", "", edge_actor, "act_passenger", "uc_pay_cashless")

    add_edge(root, "e_act11", "", edge_actor, "act_driver", "uc_driver_auth")
    add_edge(root, "e_act12", "", edge_actor, "act_driver", "uc_accept_reject")
    add_edge(root, "e_act13", "", edge_actor, "act_driver", "uc_chat")
    add_edge(root, "e_act14", "", edge_actor, "act_driver", "uc_start_ride")
    add_edge(root, "e_act15", "", edge_actor, "act_driver", "uc_cctv")
    add_edge(root, "e_act16", "", edge_actor, "act_driver", "uc_complete")
    add_edge(root, "e_act17", "", edge_actor, "act_driver", "uc_sales_summary")
    add_edge(root, "e_act18", "", edge_actor, "act_driver", "uc_sales_transfer")

    add_edge(root, "e_act19", "", edge_actor, "uc_guardian", "act_guardian")
    add_edge(root, "e_act20", "", edge_actor, "uc_deviation", "act_guardian")
    add_edge(root, "e_act21", "", edge_actor, "uc_verify_pay", "act_payment")
    add_edge(root, "e_act22", "", edge_actor, "uc_sales_transfer", "act_payment")
    add_edge(root, "e_act23", "", edge_actor, "uc_cctv_upload", "act_cloud")

    edge_inc = "endArrow=open;dashed=1;html=1;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontColor=#000000;"
    add_edge(root, "e_rel1", "&lt;&lt;extend&gt;&gt;", edge_inc, "uc_stops", "uc_dest")
    add_edge(root, "e_rel2", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_call", "uc_fare")
    add_edge(root, "e_rel3", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_call", "uc_dispatch")
    add_edge(root, "e_rel4", "&lt;&lt;extend&gt;&gt;", edge_inc, "uc_reassign", "uc_dispatch")
    add_edge(root, "e_rel5", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_start_ride", "uc_guardian")
    add_edge(root, "e_rel6", "&lt;&lt;extend&gt;&gt;", edge_inc, "uc_deviation", "uc_guardian")
    add_edge(root, "e_rel7", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_cctv", "uc_cctv_upload")
    add_edge(root, "e_rel8", "&lt;&lt;include&gt;&gt;", edge_inc, "uc_pay_cashless", "uc_verify_pay")


# -----------------------------------------------------------------------------
# 2. SYSTEM PROCESS FLOWCHART GENERATOR
# -----------------------------------------------------------------------------
def build_system_flowchart(root):
    p_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    d_style = "rhombus;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=10;spacing=2;"
    start_style = "rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;strokeWidth=2;fontColor=#FFFFFF;fontStyle=1;fontSize=12;"
    safety_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#F8F8F8;strokeColor=#000000;strokeWidth=1.5;strokeDasharray=4 4;fontColor=#000000;fontStyle=1;fontSize=11;"
    edge_style = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"

    add_cell(root, "col_p", "<b>PASSENGER (USER APP)</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=26;fontColor=#000000;", 40, 40, 360, 1480)
    add_cell(root, "col_d", "<b>GO DISPATCH ENGINE</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=26;fontColor=#000000;", 420, 40, 360, 1480)
    add_cell(root, "col_dr", "<b>DRIVER (DRIVER APP)</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=26;fontColor=#000000;", 800, 40, 360, 1480)
    add_cell(root, "col_s", "<b>GUARDIAN & CCTV SAFETY</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=26;fontColor=#000000;", 1180, 40, 360, 1480)
    add_cell(root, "col_pay", "<b>PAYMENT & SETTLEMENT</b>", "swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;startSize=26;fontColor=#000000;", 1560, 40, 360, 1480)

    add_cell(root, "f_p1", "Passenger Opens App", start_style, 100, 80, 240, 45, parent="col_p")
    add_cell(root, "f_p2", "First Login?", d_style, 160, 150, 120, 60, parent="col_p")
    add_cell(root, "f_p3", "Register (Phone OTP, Profile)", p_style, 100, 240, 240, 40, parent="col_p")
    add_cell(root, "f_p4", "Landing Page (Call Taxi / Fav / Guardian)", p_style, 100, 310, 240, 45, parent="col_p")
    add_cell(root, "f_p5", "Select Pickup Point\n(GPS / Fav / Map / Search)", p_style, 100, 380, 240, 45, parent="col_p")
    add_cell(root, "f_p6", "Select Destination Point\n(GPS / Fav / Map / Search)", p_style, 100, 450, 240, 45, parent="col_p")
    add_cell(root, "f_p7", "Add Extra Stop?", d_style, 160, 520, 120, 60, parent="col_p")
    add_cell(root, "f_p8", "Add Waypoint", p_style, 100, 600, 240, 40, parent="col_p")
    add_cell(root, "f_p9", "Review Polyline & Estimated Fare", p_style, 100, 660, 240, 45, parent="col_p")
    add_cell(root, "f_p10", "Tap 'Call Now' (Request Ride)", start_style, 100, 730, 240, 45, parent="col_p")
    add_cell(root, "f_p11", "View Driver Profile & ETA on Map", p_style, 100, 820, 240, 45, parent="col_p")
    add_cell(root, "f_p12", "In-App Chat Active", p_style, 100, 890, 240, 40, parent="col_p")
    add_cell(root, "f_p13", "Board Taxi & Ride", start_style, 100, 960, 240, 45, parent="col_p")
    add_cell(root, "f_p14", "Arrive Destination & View Fare", p_style, 100, 1080, 240, 45, parent="col_p")
    add_cell(root, "f_p15", "Select Cash or Cashless", d_style, 150, 1160, 140, 60, parent="col_p")
    add_cell(root, "f_p16", "Display 'Thank You' & Rating", p_style, 100, 1370, 240, 45, parent="col_p")

    add_cell(root, "f_d1", "Compute Route & Dynamic Fare", p_style, 480, 660, 240, 45, parent="col_d")
    add_cell(root, "f_d2", "Search Nearest Drivers (Redis Geo)", p_style, 480, 730, 240, 45, parent="col_d")
    add_cell(root, "f_d3", "Send 15s Offer to Candidate Driver", p_style, 480, 800, 240, 45, parent="col_d")
    add_cell(root, "f_d4", "Driver Accepted?", d_style, 540, 870, 120, 60, parent="col_d")
    add_cell(root, "f_d5", "Cascade to Next Nearest Driver", p_style, 480, 950, 240, 40, parent="col_d")
    add_cell(root, "f_d6", "Assign Driver & Open WebSocket Room", p_style, 480, 1010, 240, 45, parent="col_d")

    add_cell(root, "f_dr1", "Driver Login & Shift (Available)", p_style, 860, 200, 240, 45, parent="col_dr")
    add_cell(root, "f_dr2", "Status Toggle (Break / Duty / Avail)", d_style, 910, 280, 140, 60, parent="col_dr")
    add_cell(root, "f_dr3", "Receive Ride Offer Notification", p_style, 860, 800, 240, 45, parent="col_dr")
    add_cell(root, "f_dr4", "Accept or Reject Decision", d_style, 910, 870, 140, 60, parent="col_dr")
    add_cell(root, "f_dr5", "Navigate to Pickup Location", p_style, 860, 950, 240, 45, parent="col_dr")
    add_cell(root, "f_dr6", "Tap 'Arrive Pickup' -> Close Chat", p_style, 860, 1010, 240, 45, parent="col_dr")
    add_cell(root, "f_dr7", "Tap 'Start Ride' -> Turn-by-Turn", start_style, 860, 1080, 240, 45, parent="col_dr")
    add_cell(root, "f_dr8", "Arrive Destination & Final Fare", p_style, 860, 1160, 240, 45, parent="col_dr")
    add_cell(root, "f_dr9", "Confirm Cash Received", p_style, 860, 1240, 240, 40, parent="col_dr")
    add_cell(root, "f_dr10", "View Sales Summary & Orders", p_style, 860, 1330, 240, 45, parent="col_dr")
    add_cell(root, "f_dr11", "Transfer Sales (Payout to Wallet)", start_style, 860, 1400, 240, 45, parent="col_dr")

    add_cell(root, "f_s1", "Activate Guardian Mode\n(Push 'Ride Started' to Family)", safety_style, 1240, 1080, 240, 50, parent="col_s")
    add_cell(root, "f_s2", "Stream Real-Time Live GPS to Family", safety_style, 1240, 1150, 240, 45, parent="col_s")
    add_cell(root, "f_s3", "Detect Route Deviation\n(Cross-track > 300m for > 45s)", d_style, 1290, 1220, 140, 60, parent="col_s")
    add_cell(root, "f_s4", "CRITICAL ALERT: Off-Route Warning", safety_style, 1240, 1300, 240, 45, parent="col_s")
    add_cell(root, "f_s5", "Protecting Mode: Record CCTV & GPS", safety_style, 1240, 960, 240, 45, parent="col_s")
    add_cell(root, "f_s6", "Stream / Upload Encrypted Video Chunks", safety_style, 1240, 1020, 240, 45, parent="col_s")
    add_cell(root, "f_s7", "Trip Done: Push 'Safely Arrived' & Stop", safety_style, 1240, 1370, 240, 45, parent="col_s")

    add_cell(root, "f_pay1", "Select E-Wallet (KPay/AYAPay)", p_style, 1620, 1160, 240, 45, parent="col_pay")
    add_cell(root, "f_pay2", "Deep-Link Jump to Wallet App", p_style, 1620, 1230, 240, 45, parent="col_pay")
    add_cell(root, "f_pay3", "Authenticate & Confirm Payment", p_style, 1620, 1290, 240, 40, parent="col_pay")
    add_cell(root, "f_pay4", "Deep-Link Return & Webhook Verify", p_style, 1620, 1350, 240, 45, parent="col_pay")
    add_cell(root, "f_pay5", "Credit Driver Wallet Balance", start_style, 1620, 1410, 240, 45, parent="col_pay")

    add_edge(root, "fe_1", "", edge_style, "f_p1", "f_p2")
    add_edge(root, "fe_2", "Yes", edge_style, "f_p2", "f_p3")
    add_edge(root, "fe_3", "No", edge_style, "f_p2", "f_p4")
    add_edge(root, "fe_4", "", edge_style, "f_p3", "f_p4")
    add_edge(root, "fe_5", "", edge_style, "f_p4", "f_p5")
    add_edge(root, "fe_6", "", edge_style, "f_p5", "f_p6")
    add_edge(root, "fe_7", "", edge_style, "f_p6", "f_p7")
    add_edge(root, "fe_8", "Yes", edge_style, "f_p7", "f_p8")
    add_edge(root, "fe_9", "", edge_style, "f_p8", "f_p6")
    add_edge(root, "fe_10", "No", edge_style, "f_p7", "f_d1")
    add_edge(root, "fe_11", "", edge_style, "f_d1", "f_p9")
    add_edge(root, "fe_12", "", edge_style, "f_p9", "f_p10")
    add_edge(root, "fe_13", "", edge_style, "f_p10", "f_d2")
    add_edge(root, "fe_14", "", edge_style, "f_d2", "f_d3")
    add_edge(root, "fe_15", "", edge_style, "f_d3", "f_dr3")
    add_edge(root, "fe_16", "", edge_style, "f_dr3", "f_dr4")
    add_edge(root, "fe_17", "Reject/Timeout", edge_style, "f_dr4", "f_d5")
    add_edge(root, "fe_18", "", edge_style, "f_d5", "f_d3")
    add_edge(root, "fe_19", "Accept", edge_style, "f_dr4", "f_d6")
    add_edge(root, "fe_20", "", edge_style, "f_d6", "f_p11")
    add_edge(root, "fe_21", "", edge_style, "f_d6", "f_dr5")
    add_edge(root, "fe_22", "", edge_style, "f_p11", "f_p12")
    add_edge(root, "fe_23", "", edge_style, "f_dr5", "f_dr6")
    add_edge(root, "fe_24", "", edge_style, "f_dr6", "f_p13")
    add_edge(root, "fe_25", "", edge_style, "f_p13", "f_dr7")
    add_edge(root, "fe_26", "", edge_style, "f_dr7", "f_s1")
    add_edge(root, "fe_27", "", edge_style, "f_dr7", "f_s5")
    add_edge(root, "fe_28", "", edge_style, "f_s5", "f_s6")
    add_edge(root, "fe_29", "", edge_style, "f_s1", "f_s2")
    add_edge(root, "fe_30", "", edge_style, "f_s2", "f_s3")
    add_edge(root, "fe_31", "Yes", edge_style, "f_s3", "f_s4")
    add_edge(root, "fe_32", "No", edge_style, "f_s3", "f_dr8")
    add_edge(root, "fe_33", "", edge_style, "f_dr8", "f_p14")
    add_edge(root, "fe_34", "", edge_style, "f_p14", "f_p15")
    add_edge(root, "fe_35", "Cash", edge_style, "f_p15", "f_dr9")
    add_edge(root, "fe_36", "Cashless", edge_style, "f_p15", "f_pay1")
    add_edge(root, "fe_37", "", edge_style, "f_pay1", "f_pay2")
    add_edge(root, "fe_38", "", edge_style, "f_pay2", "f_pay3")
    add_edge(root, "fe_39", "", edge_style, "f_pay3", "f_pay4")
    add_edge(root, "fe_40", "", edge_style, "f_pay4", "f_pay5")
    add_edge(root, "fe_41", "", edge_style, "f_dr9", "f_s7")
    add_edge(root, "fe_42", "", edge_style, "f_pay5", "f_s7")
    add_edge(root, "fe_43", "", edge_style, "f_s7", "f_p16")
    add_edge(root, "fe_44", "", edge_style, "f_pay5", "f_dr10")
    add_edge(root, "fe_45", "", edge_style, "f_dr10", "f_dr11")


# -----------------------------------------------------------------------------
# 3. DATABASE ERD SCHEMA GENERATOR
# -----------------------------------------------------------------------------
def build_database_erd(root):
    table_style = "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=12;"
    row_pk = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#000000;fontSize=10;fontStyle=1;"
    row_norm = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#000000;fontSize=10;"
    edge_erd = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=ERmany;startArrow=ERone;endFill=0;startFill=0;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"

    def create_table(tid, title, x, y, width, rows):
        t_height = 26 + len(rows) * 20
        tbl = add_cell(root, tid, f"<b>{title}</b>", table_style, x, y, width, t_height)
        for i, (is_pk, txt) in enumerate(rows):
            r_style = row_pk if is_pk else row_norm
            add_cell(root, f"{tid}_r{i}", txt, r_style, 0, 26 + i * 20, width, 20, parent=tid)
        return tbl

    create_table("t_users", "USERS", 40, 40, 260, [
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

    create_table("t_favs", "FAVORITE_LOCATIONS", 40, 310, 260, [
        (True, "PK  id: uuid"),
        (False, "FK  user_id: uuid"),
        (False, "    label: varchar(50)"),
        (False, "    address_text: text"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_guardians", "GUARDIAN_RELATIONSHIPS", 40, 530, 260, [
        (True, "PK  id: uuid"),
        (False, "FK  passenger_id: uuid"),
        (False, "FK  guardian_id: uuid"),
        (False, "    relationship_type: varchar(50)"),
        (False, "    is_active: boolean"),
        (False, "    notify_ride_start: boolean"),
        (False, "    notify_deviation: boolean"),
        (False, "    created_at: timestamp")
    ])

    create_table("t_safety_alerts", "SAFETY_ALERTS", 40, 770, 260, [
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

    create_table("t_drivers", "DRIVERS", 380, 40, 270, [
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

    create_table("t_vehicles", "VEHICLES", 380, 360, 270, [
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

    create_table("t_status_logs", "DRIVER_STATUS_LOGS", 380, 640, 270, [
        (True, "PK  id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    previous_status: varchar(20)"),
        (False, "    new_status: varchar(20)"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    changed_at: timestamp")
    ])

    create_table("t_gps_logs", "GPS_TELEMETRY_LOGS", 380, 850, 270, [
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

    create_table("t_rides", "RIDES", 730, 40, 280, [
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

    create_table("t_waypoints", "RIDE_WAYPOINTS", 730, 590, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "    stop_order: integer"),
        (False, "    address_text: text"),
        (False, "    latitude: decimal(10,8)"),
        (False, "    longitude: decimal(11,8)"),
        (False, "    is_visited: boolean"),
        (False, "    visited_at: timestamp")
    ])

    create_table("t_dispatches", "RIDE_DISPATCHES", 730, 810, 280, [
        (True, "PK  id: uuid"),
        (False, "FK  ride_id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    dispatch_status: varchar(20)"),
        (False, "    driver_distance_km: decimal(5,2)"),
        (False, "    offered_at: timestamp"),
        (False, "    responded_at: timestamp"),
        (False, "    timeout_at: timestamp")
    ])

    create_table("t_cctv", "CCTV_RECORDINGS", 730, 1030, 280, [
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

    create_table("t_chat", "CHAT_MESSAGES", 1090, 40, 260, [
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

    create_table("t_payments", "PAYMENTS", 1090, 290, 260, [
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

    create_table("t_wallets", "DRIVER_WALLETS", 1090, 600, 260, [
        (True, "PK  id: uuid"),
        (False, "FK  driver_id: uuid"),
        (False, "    total_earned: decimal(14,2)"),
        (False, "    available_balance: decimal(14,2)"),
        (False, "    pending_balance: decimal(14,2)"),
        (False, "    currency: varchar(5)"),
        (False, "    updated_at: timestamp")
    ])

    create_table("t_payouts", "DRIVER_PAYOUTS", 1090, 810, 260, [
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

    add_edge(root, "er_1", "1 to N", edge_erd, "t_users", "t_favs")
    add_edge(root, "er_2", "1 to N", edge_erd, "t_users", "t_guardians")
    add_edge(root, "er_3", "1 to 1", edge_erd, "t_users", "t_drivers")
    add_edge(root, "er_4", "1 to N", edge_erd, "t_users", "t_rides")
    add_edge(root, "er_5", "1 to N", edge_erd, "t_users", "t_chat")
    add_edge(root, "er_6", "1 to N", edge_erd, "t_users", "t_payments")

    add_edge(root, "er_7", "1 to N", edge_erd, "t_drivers", "t_vehicles")
    add_edge(root, "er_8", "1 to N", edge_erd, "t_drivers", "t_status_logs")
    add_edge(root, "er_9", "1 to N", edge_erd, "t_drivers", "t_rides")
    add_edge(root, "er_10", "1 to N", edge_erd, "t_drivers", "t_dispatches")
    add_edge(root, "er_11", "1 to 1", edge_erd, "t_drivers", "t_wallets")
    add_edge(root, "er_12", "1 to N", edge_erd, "t_drivers", "t_payouts")
    add_edge(root, "er_13", "1 to N", edge_erd, "t_drivers", "t_gps_logs")

    add_edge(root, "er_14", "1 to N", edge_erd, "t_rides", "t_waypoints")
    add_edge(root, "er_15", "1 to N", edge_erd, "t_rides", "t_dispatches")
    add_edge(root, "er_16", "1 to N", edge_erd, "t_rides", "t_chat")
    add_edge(root, "er_17", "1 to N", edge_erd, "t_rides", "t_gps_logs")
    add_edge(root, "er_18", "1 to N", edge_erd, "t_rides", "t_cctv")
    add_edge(root, "er_19", "1 to N", edge_erd, "t_rides", "t_safety_alerts")
    add_edge(root, "er_20", "1 to 1", edge_erd, "t_rides", "t_payments")

    add_edge(root, "er_21", "1 to N", edge_erd, "t_wallets", "t_payouts")


# -----------------------------------------------------------------------------
# 4. COMPONENT ARCHITECTURE GENERATOR
# -----------------------------------------------------------------------------
def build_component_architecture(root):
    c_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    sub_style = "swimlane;whiteSpace=wrap;html=1;fillColor=#FAFAFA;strokeColor=#000000;strokeWidth=2;fontColor=#000000;startSize=26;horizontal=1;fontStyle=1;fontSize=12;"
    data_style = "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=10;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    edge_comp = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"

    add_cell(root, "tier_1", "<b>1. Client Tier (Native iOS Swift & Android Kotlin)</b>", sub_style, 40, 40, 1500, 160)
    add_cell(root, "app_p", "<b>Passenger Native App</b>\n- SwiftUI / Jetpack Compose\n- CoreLocation GPS\n- Deep-link Payment Return", c_style, 80, 80, 360, 90, parent="tier_1")
    add_cell(root, "app_d", "<b>Driver Native App</b>\n- Turn-by-Turn Metering\n- CameraX / AVFoundation CCTV\n- High-Freq GPS Streamer", c_style, 600, 80, 380, 90, parent="tier_1")
    add_cell(root, "app_g", "<b>Guardian Native View</b>\n- Real-Time Family Map\n- Emergency Alert Listener\n- Route Deviation Warning", c_style, 1120, 80, 360, 90, parent="tier_1")

    add_cell(root, "tier_2", "<b>2. Edge & API Gateway Tier</b>", sub_style, 40, 240, 1500, 130)
    add_cell(root, "gw_edge", "<b>Go API Gateway & Reverse Proxy</b>\n- TLS 1.3 Termination | JWT Auth Verification | Rate Limiting | WebSocket Connection Multiplexing", c_style, 80, 280, 1420, 65, parent="tier_2")

    add_cell(root, "tier_3", "<b>3. Go Backend Core Application Tier (Goroutines, Clean Architecture)</b>", sub_style, 40, 410, 1500, 240)
    add_cell(root, "svc_auth", "<b>Auth & User Service</b>\n- User/Driver Profiles\n- Family Guardians", c_style, 80, 460, 240, 80, parent="tier_3")
    add_cell(root, "svc_dispatch", "<b>Dispatch Engine</b>\n- Multi-Stop Fare Calc\n- Spatial Matchmaker\n- Cascading Timer Pool", c_style, 360, 460, 260, 80, parent="tier_3")
    add_cell(root, "svc_realtime", "<b>Real-Time & Telemetry Hub</b>\n- WebSocket Hub\n- In-App Chat Router\n- GPS Ingestion Worker", c_style, 660, 460, 260, 80, parent="tier_3")
    add_cell(root, "svc_safety", "<b>Safety & CCTV Ingestion</b>\n- Geofence Deviation Engine\n- Encrypted CCTV Chunker\n- SHA-256 Cloud Vault", c_style, 960, 460, 260, 80, parent="tier_3")
    add_cell(root, "svc_billing", "<b>Payment & Wallet Service</b>\n- KBZPay/AYAPay Handler\n- Webhook HMAC Verifier\n- Driver Wallet Ledger", c_style, 1260, 460, 240, 80, parent="tier_3")

    add_cell(root, "tier_4", "<b>4. Persistence, Cache & Storage Tier</b>", sub_style, 40, 690, 1500, 160)
    add_cell(root, "db_postgres", "<b>PostgreSQL 16 + PostGIS</b>\n- Relational Master Schema\n- Spatial Query Index (GIST)\n- Double-Entry Financial Ledger", data_style, 120, 730, 360, 95, parent="tier_4")
    add_cell(root, "cache_redis", "<b>Redis 7 Cluster</b>\n- Geospatial Index (GEOADD)\n- Pub/Sub Telemetry Broker\n- Distributed Locks (Redlock)", data_style, 600, 730, 380, 95, parent="tier_4")
    add_cell(root, "storage_s3", "<b>Encrypted S3 Media Vault</b>\n- CCTV Video Chunks & Digests\n- Driver Verification Files\n- Transaction Audit Records", data_style, 1120, 730, 360, 95, parent="tier_4")

    add_cell(root, "tier_5", "<b>5. External Integrations Tier</b>", sub_style, 40, 890, 1500, 140)
    add_cell(root, "ext_map", "<b>Routing Engine</b>\n(OSRM / Mapbox)", c_style, 120, 940, 360, 60, parent="tier_5")
    add_cell(root, "ext_pay", "<b>Payment Gateways</b>\n(KBZPay / AYAPay / Wave)", c_style, 600, 940, 380, 60, parent="tier_5")
    add_cell(root, "ext_push", "<b>Push Notifications</b>\n(Apple APNs / Google FCM)", c_style, 1120, 940, 360, 60, parent="tier_5")

    add_edge(root, "ce_1", "HTTPS / WSS", edge_comp, "app_p", "gw_edge")
    add_edge(root, "ce_2", "HTTPS / WSS / gRPC", edge_comp, "app_d", "gw_edge")
    add_edge(root, "ce_3", "HTTPS / WSS", edge_comp, "app_g", "gw_edge")

    add_edge(root, "ce_4", "", edge_comp, "gw_edge", "svc_auth")
    add_edge(root, "ce_5", "", edge_comp, "gw_edge", "svc_dispatch")
    add_edge(root, "ce_6", "", edge_comp, "gw_edge", "svc_realtime")
    add_edge(root, "ce_7", "", edge_comp, "gw_edge", "svc_safety")
    add_edge(root, "ce_8", "", edge_comp, "gw_edge", "svc_billing")

    add_edge(root, "ce_9", "Persist Master", edge_comp, "svc_auth", "db_postgres")
    add_edge(root, "ce_10", "Query Radius", edge_comp, "svc_dispatch", "cache_redis")
    add_edge(root, "ce_11", "Stream Coords", edge_comp, "svc_realtime", "cache_redis")
    add_edge(root, "ce_12", "Vault Footage", edge_comp, "svc_safety", "storage_s3")
    add_edge(root, "ce_13", "Atomic Ledger", edge_comp, "svc_billing", "db_postgres")

    add_edge(root, "ce_14", "Routing Polyline", edge_comp, "svc_dispatch", "ext_map")
    add_edge(root, "ce_15", "Webhook / PreOrder", edge_comp, "svc_billing", "ext_pay")
    add_edge(root, "ce_16", "Emergency Push", edge_comp, "svc_safety", "ext_push")


# -----------------------------------------------------------------------------
# 5. CLASS & DOMAIN ARCHITECTURE GENERATOR
# -----------------------------------------------------------------------------
def build_class_diagram(root):
    cls_box = "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;"
    cls_member = "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#000000;fontSize=10;"
    cls_div = "line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;"
    edge_assoc = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=open;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"
    edge_impl = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;endArrow=block;endFill=0;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"

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

    # Domain Structs
    create_class("c_user", "User", 40, 40, 260, [
        "+ ID: UUID", "+ PhoneNumber: string", "+ FullName: string", "+ Role: UserRole"
    ], ["+ GetGuardians(): []User", "+ AddFavorite(loc): error"])

    create_class("c_driver", "Driver", 340, 40, 260, [
        "+ ID: UUID", "+ UserID: UUID", "+ Status: DriverStatus", "+ Rating: float64"
    ], ["+ IsAvailable(): bool", "+ UpdateStatus(s): error"])

    create_class("c_ride", "Ride", 640, 40, 280, [
        "+ ID: UUID", "+ PassengerID: UUID", "+ DriverID: *UUID", "+ Status: RideStatus",
        "+ Pickup: GeoPoint", "+ FinalDest: GeoPoint", "+ EstimatedFare: Money"
    ], ["+ AddWaypoint(p): error", "+ StartTrip(): error", "+ CompleteTrip(): error"])

    create_class("c_safety", "SafetySession", 960, 40, 260, [
        "+ RideID: UUID", "+ GuardianActive: bool", "+ CCTVActive: bool"
    ], ["+ CheckDeviation(pt): bool", "+ StreamChunk(c): error"])

    create_class("c_wallet", "DriverWallet", 1260, 40, 240, [
        "+ DriverID: UUID", "+ Balance: Money", "+ Pending: Money"
    ], ["+ Credit(m): error", "+ RequestPayout(m): error"])

    # Golang Service Interfaces
    create_class("i_ride_uc", "&lt;&lt;interface&gt;&gt;\nRideUseCase", 40, 280, 280, [], [
        "+ RequestRide(ctx, req): (Ride, error)",
        "+ DispatchNextDriver(ctx, rideID): error",
        "+ AcceptRide(ctx, rideID, driverID): error",
        "+ CompleteRide(ctx, rideID): error"
    ])

    create_class("i_safety_uc", "&lt;&lt;interface&gt;&gt;\nSafetyUseCase", 360, 280, 280, [], [
        "+ ActivateGuardian(ctx, rideID): error",
        "+ StreamGPS(ctx, rideID, pt): error",
        "+ StartProtectingCCTV(ctx, rideID): error",
        "+ DeactivateSafety(ctx, rideID): error"
    ])

    create_class("i_pay_uc", "&lt;&lt;interface&gt;&gt;\nPaymentUseCase", 680, 280, 280, [], [
        "+ InitiateCashless(ctx, req): (DeepLink, error)",
        "+ HandleWebhook(ctx, sig, body): error",
        "+ ConfirmCash(ctx, rideID): error",
        "+ DisbursePayout(ctx, driverID, m): error"
    ])

    # Native Mobile ViewModels
    create_class("vm_passenger", "PassengerViewModel\n(Native iOS/Android)", 40, 500, 280, [
        "+ CurrentRideState: State", "+ EstimatedFare: Fare"
    ], ["+ CallTaxi()", "+ SelectPayment(m)", "+ SendChat(msg)"])

    create_class("vm_driver", "DriverViewModel\n(Native iOS/Android)", 360, 500, 280, [
        "+ Status: DriverStatus", "+ CurrentOffer: Offer"
    ], ["+ ToggleStatus(s)", "+ AcceptBooking()", "+ TransferSales()"])

    create_class("vm_cctv", "NativeCCTVManager\n(AVFoundation / CameraX)", 680, 500, 280, [
        "+ CaptureSession: Session", "+ GPSLogger: Logger"
    ], ["+ StartRecording()", "+ StreamEncryptedChunks()", "+ Stop()"])

    add_edge(root, "ca_1", "1 to N", edge_assoc, "c_user", "c_ride")
    add_edge(root, "ca_2", "1 to N", edge_assoc, "c_driver", "c_ride")
    add_edge(root, "ca_3", "1 to 1", edge_assoc, "c_ride", "c_safety")
    add_edge(root, "ca_4", "1 to 1", edge_assoc, "c_driver", "c_wallet")

    add_edge(root, "ci_1", "calls", edge_impl, "vm_passenger", "i_ride_uc")
    add_edge(root, "ci_2", "calls", edge_impl, "vm_driver", "i_ride_uc")
    add_edge(root, "ci_3", "controls", edge_assoc, "vm_driver", "vm_cctv")
    add_edge(root, "ci_4", "syncs", edge_impl, "vm_cctv", "i_safety_uc")


# -----------------------------------------------------------------------------
# 6. SEQUENCE DIAGRAM: DISPATCH & CHAT
# -----------------------------------------------------------------------------
def build_sequence_dispatch(root):
    ll_style = "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    edge_msg = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"
    edge_reply = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;endArrow=open;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontColor=#000000;"

    # Lifelines
    add_cell(root, "sq_p", "Passenger App\n(Native)", ll_style, 60, 40, 140, 750)
    add_cell(root, "sq_gw", "Go API Gateway\n& Reverse Proxy", ll_style, 260, 40, 140, 750)
    add_cell(root, "sq_disp", "Go Dispatch\nEngine", ll_style, 460, 40, 140, 750)
    add_cell(root, "sq_redis", "Redis Cluster\n(Spatial/PubSub)", ll_style, 660, 40, 140, 750)
    add_cell(root, "sq_chat", "Go WebSocket\nChat Service", ll_style, 860, 40, 140, 750)
    add_cell(root, "sq_dr1", "Driver 1\n(Candidate)", ll_style, 1060, 40, 140, 750)
    add_cell(root, "sq_dr2", "Driver 2\n(Assigned)", ll_style, 1260, 40, 140, 750)

    # Sequence Messages
    # Step 1: Estimate
    add_edge(root, "sm_1", "1. POST /estimate (Pickup, Dest, Waypoints)", edge_msg, "sq_p", "sq_gw")
    add_edge(root, "sm_2", "2. Return Estimated Fare & Polyline", edge_reply, "sq_gw", "sq_p")

    # Step 2: Call Now
    add_edge(root, "sm_3", "3. POST /rides/request ('Call Now')", edge_msg, "sq_p", "sq_gw")
    add_edge(root, "sm_4", "4. CreateRideOrder(SEARCHING)", edge_msg, "sq_gw", "sq_disp")
    add_edge(root, "sm_5", "5. GEORADIUS 3km nearby drivers", edge_msg, "sq_disp", "sq_redis")
    add_edge(root, "sm_6", "6. Ranked Drivers: [Driver1, Driver2]", edge_reply, "sq_redis", "sq_disp")

    # Step 3: Offer to Driver 1 & Cascade
    add_edge(root, "sm_7", "7. Push Offer (15s Timer)", edge_msg, "sq_disp", "sq_dr1")
    add_edge(root, "sm_8", "8. Driver 1 Rejects / Timeout", edge_reply, "sq_dr1", "sq_disp")
    add_edge(root, "sm_9", "9. Cascade Offer to Driver 2", edge_msg, "sq_disp", "sq_dr2")
    add_edge(root, "sm_10", "10. Driver 2 Accepts Ride", edge_msg, "sq_dr2", "sq_disp")

    # Step 4: Assignment & In-App Chat
    add_edge(root, "sm_11", "11. Push: Driver Assigned & ETA", edge_msg, "sq_disp", "sq_p")
    add_edge(root, "sm_12", "12. Open WebSocket Room", edge_msg, "sq_disp", "sq_chat")
    add_edge(root, "sm_13", "13. Send Message ('Near gate')", edge_msg, "sq_p", "sq_chat")
    add_edge(root, "sm_14", "14. Deliver Message ('Near gate')", edge_msg, "sq_chat", "sq_dr2")
    add_edge(root, "sm_15", "15. Driver Arrived Pickup -> Close Chat", edge_msg, "sq_dr2", "sq_gw")


# -----------------------------------------------------------------------------
# 7. STATE MACHINE: RIDE LIFECYCLE
# -----------------------------------------------------------------------------
def build_state_machine_ride(root):
    state_style = "rounded=1;arcSize=20;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontStyle=1;fontSize=11;"
    start_pt = "ellipse;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;"
    edge_st = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;fontSize=10;fontColor=#000000;"

    add_cell(root, "st_start", "", start_pt, 60, 100, 30, 30)
    add_cell(root, "st_draft", "<b>DRAFT</b>\nSelecting stops & fare preview", state_style, 140, 80, 200, 60)
    add_cell(root, "st_searching", "<b>SEARCHING</b>\nEvaluating nearest drivers", state_style, 400, 80, 200, 60)
    add_cell(root, "st_dispatched", "<b>DISPATCHED</b>\n15s Offer countdown", state_style, 660, 80, 200, 60)
    add_cell(root, "st_accepted", "<b>ACCEPTED / ARRIVING</b>\nEn route to pickup & chat open", state_style, 920, 80, 200, 60)
    add_cell(root, "st_at_pickup", "<b>ARRIVED_AT_PICKUP</b>\nChat closed / boarding", state_style, 920, 200, 200, 60)
    add_cell(root, "st_in_transit", "<b>IN_TRANSIT</b>\nGuardian Live & CCTV Active", state_style, 660, 200, 200, 60)
    add_cell(root, "st_at_dest", "<b>ARRIVED_DESTINATION</b>\nFinal fare displayed", state_style, 400, 200, 200, 60)
    add_cell(root, "st_payment", "<b>PAYMENT_PROCESSING</b>\nCash / Cashless verification", state_style, 140, 200, 200, 60)
    add_cell(root, "st_completed", "<b>COMPLETED</b>\nSafety teardown & receipts", state_style, 140, 320, 200, 60)
    add_cell(root, "st_end", "", start_pt, 400, 335, 30, 30)

    add_edge(root, "se_1", "Open Screen", edge_st, "st_start", "st_draft")
    add_edge(root, "se_2", "Tap 'Call Now'", edge_st, "st_draft", "st_searching")
    add_edge(root, "se_3", "Driver Found", edge_st, "st_searching", "st_dispatched")
    add_edge(root, "se_4", "Driver Rejects/Timeout", edge_st, "st_dispatched", "st_searching")
    add_edge(root, "se_5", "Driver Accepts", edge_st, "st_dispatched", "st_accepted")
    add_edge(root, "se_6", "Arrive Pickup", edge_st, "st_accepted", "st_at_pickup")
    add_edge(root, "se_7", "Start Ride", edge_st, "st_at_pickup", "st_in_transit")
    add_edge(root, "se_8", "Arrive Dest", edge_st, "st_in_transit", "st_at_dest")
    add_edge(root, "se_9", "Select Method", edge_st, "st_at_dest", "st_payment")
    add_edge(root, "se_10", "Payment Confirmed", edge_st, "st_payment", "st_completed")
    add_edge(root, "se_11", "Archive Trip", edge_st, "st_completed", "st_end")


def export_drawio_file(build_fn, filename, tab_name="Diagram"):
    mxfile = create_mxfile()
    root = add_diagram_tab(mxfile, "diag_1", tab_name)
    build_fn(root)
    
    xml_str = ET.tostring(mxfile, encoding="utf-8")
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent="  ")
    cleaned_lines = [line for line in pretty_xml.split("\n") if line.strip()]
    final_xml = "\n".join(cleaned_lines)
    
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(final_xml)
    print(f"Successfully generated: {filepath}")

def export_all_in_one_master():
    mxfile = create_mxfile()
    
    r1 = add_diagram_tab(mxfile, "tab_1", "01_Use_Case_Model", 1800, 1200)
    build_use_case_diagram(r1)
    
    r2 = add_diagram_tab(mxfile, "tab_2", "02_System_Process_Flowchart", 2000, 1600)
    build_system_flowchart(r2)
    
    r3 = add_diagram_tab(mxfile, "tab_3", "03_Database_ERD_Schema", 1600, 1400)
    build_database_erd(r3)
    
    r4 = add_diagram_tab(mxfile, "tab_4", "04_Component_Architecture", 1600, 1200)
    build_component_architecture(r4)

    r5 = add_diagram_tab(mxfile, "tab_5", "05_Class_Domain_Architecture", 1600, 1000)
    build_class_diagram(r5)

    r6 = add_diagram_tab(mxfile, "tab_6", "06_Sequence_Dispatch_Chat", 1600, 1000)
    build_sequence_dispatch(r6)

    r7 = add_diagram_tab(mxfile, "tab_7", "07_State_Machine_Ride_Lifecycle", 1400, 800)
    build_state_machine_ride(r7)

    xml_str = ET.tostring(mxfile, encoding="utf-8")
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent="  ")
    cleaned_lines = [line for line in pretty_xml.split("\n") if line.strip()]
    final_xml = "\n".join(cleaned_lines)
    
    filepath = os.path.join(OUTPUT_DIR, "taxi_master_all_in_one.drawio")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(final_xml)
    print(f"Successfully generated Master All-in-One Draw.io: {filepath}")

if __name__ == "__main__":
    export_drawio_file(build_use_case_diagram, "01_use_case_diagram.drawio", "UML 2.5 Use Case Diagram")
    export_drawio_file(build_system_flowchart, "02_system_process_flowchart.drawio", "System Process Flowchart")
    export_drawio_file(build_database_erd, "03_database_erd_schema.drawio", "Database ERD Schema")
    export_drawio_file(build_component_architecture, "04_component_architecture.drawio", "Component Architecture")
    export_drawio_file(build_class_diagram, "05_class_domain_architecture.drawio", "Class & Domain Architecture")
    export_drawio_file(build_sequence_dispatch, "06_sequence_dispatch_chat.drawio", "Sequence: Dispatch & Chat")
    export_drawio_file(build_state_machine_ride, "07_state_machine_ride_lifecycle.drawio", "State Machine: Ride Lifecycle")
    export_all_in_one_master()
