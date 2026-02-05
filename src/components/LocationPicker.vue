<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  initialLat?: number
  initialLng?: number
}>()

const emit = defineEmits<{
  (e: 'update:location', coords: { lat: number; lng: number }): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

// Dushanbe default coords
const DEFAULT_LAT = 38.5598
const DEFAULT_LNG = 68.7870

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

function initMap() {
  if (!mapContainer.value) return

  const lat = props.initialLat || DEFAULT_LAT
  const lng = props.initialLng || DEFAULT_LNG

  map = L.map(mapContainer.value).setView([lat, lng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Custom icon for marker to avoid asset path issues
  const icon = L.divIcon({
    className: 'custom-pin',
    html: '<div style="background-color: #4a90e2; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
  
  marker.on('dragend', () => {
    const pos = marker!.getLatLng()
    emit('update:location', { lat: pos.lat, lng: pos.lng })
    map?.panTo(pos)
  })

  map.on('click', (e) => {
    marker!.setLatLng(e.latlng)
    emit('update:location', { lat: e.latlng.lat, lng: e.latlng.lng })
  })
}

function locateUser() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (map && marker) {
          const latlng = { lat: latitude, lng: longitude } as L.LatLngExpression
          map.setView(latlng, 15)
          marker.setLatLng(latlng)
          emit('update:location', { lat: latitude, lng: longitude })
        }
      },
      (error) => {
        console.warn('Geolocation error:', error)
        alert('Could not determine location. Please select on map.')
      }
    )
  }
}
</script>

<template>
  <div class="location-picker">
    <div ref="mapContainer" class="map-container"></div>
    <button type="button" class="locate-btn" @click="locateUser">
      📍 Find Me
    </button>
  </div>
</template>

<style scoped>
.location-picker {
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.locate-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
  background: var(--color-surface);
  color: var(--color-text);
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  cursor: pointer;
}

:deep(.leaflet-control-attribution) {
  display: none; /* Hide attribution for cleaner UI in mini app */
}
</style>
