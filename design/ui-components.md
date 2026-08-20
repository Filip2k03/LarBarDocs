# 🎛️ UI Components, Buttons & Micro-Interactions

Every component in the LarBar Taxi application adheres to strict states: **Default**, **Hover / Focus**, **Active / Pressed**, and **Disabled**, powered by physics-based cubic-bezier transitions.

---

## 🔘 Button Components & State System

### 1. Royal Gold Primary CTA Button (`btn-royal-gold`)

Used for "Call Now", "Confirm Ride", and "Transfer Sales".

```css
.btn-royal-gold {
  background: linear-gradient(135deg, #FFD54F 0%, #F59E0B 100%);
  color: #181922;
  font-weight: 700;
  font-size: 16px;
  border-radius: 12px;
  padding: 16px 28px;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.btn-royal-gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(245, 158, 11, 0.50);
  background: linear-gradient(135deg, #FFE082 0%, #D97706 100%);
}

.btn-royal-gold:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.30);
}

.btn-royal-gold:disabled {
  background: #FFE082;
  color: #78350F;
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

---

### 2. Imperial Crimson SOS & Critical Alert Button (`btn-sos-pulse`)

Used for emergency panic triggers and immediate police/guardian alerts.

```css
.btn-sos-pulse {
  background: linear-gradient(135deg, #F85A5A 0%, #E5252A 100%);
  color: #FFFFFF;
  font-weight: 800;
  font-size: 18px;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  box-shadow: 0 0 0 0 rgba(229, 37, 42, 0.7);
  animation: pulse-sos 1.8s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@keyframes pulse-sos {
  0% {
    box-shadow: 0 0 0 0 rgba(229, 37, 42, 0.7);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(229, 37, 42, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(229, 37, 42, 0);
  }
}
```

---

## 📱 Dynamic Cards & Bottom Sheets

- **Ride Booking Bottom Sheet**: Smooth draggable gesture with snap points at 25%, 50%, and 85% height.
- **Dynamic Meter HUD**: Floating semi-transparent glass card (`backdrop-filter: blur(12px)`) with real-time fare, distance, and speed.
