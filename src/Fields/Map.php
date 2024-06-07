<?php

declare(strict_types=1);

namespace Deka\MapPicker\Fields;

use Deka\MapPicker\Contracts\MapOptions;
use Filament\Forms\Components\Field;
use Filament\Forms\Concerns\HasStateBindingModifiers;

class Map extends Field implements MapOptions
{
    use HasStateBindingModifiers;

    /**
     * Field view
     */
    public string $view = 'map-picker::fields.osm-map-picker';

    /**
     * Main field config variables
     */
    private array $mapConfig = [
        'statePath' => '',
        'draggable' => true,
        'showMarker' => true,
        'tilesUrl' => 'http://tile.openstreetmap.org/{z}/{x}/{y}.png',
        'attribution' => null,
        'zoomOffset' => -1,
        'tileSize' => 512,
        'detectRetina' => false,
        'minZoom' => 0,
        'maxZoom' => 28,
        'zoom' => 15,
        'markerColor' => '#3b82f6',
        'liveLocation' => false,
    ];

    /**
     * Leaflet controls variables
     */
    private array $controls = [
        'zoomControl' => true,
        'scrollWheelZoom' => 'center',
        'doubleClickZoom' => 'center',
        'touchZoom' => 'center',
        'minZoom' => 1,
        'maxZoom' => 28,
        'zoom' => 15,
        'fullscreenControl' => true,
    ];

    /**
     * Extra leaflet controls variables
     */
    private array $extraControls = [];

    /**
     * Create json configuration string
     */
    public function getMapConfig(): string
    {
        return json_encode(
            array_merge($this->mapConfig, [
                'statePath' => $this->getStatePath(),
                'controls' => array_merge($this->controls, $this->extraControls),
            ])
        );
    }

    /**
     * Determine if user can drag map around or not.
     *
     * @return MapOptions
     *
     * @note Default value is false
     */
    public function draggable(bool $draggable = true): self
    {
        $this->mapConfig['draggable'] = $draggable;

        return $this;
    }

    /**
     * Set default zoom
     *
     * @return MapOptions
     *
     * @note Default value 19
     */
    public function zoom(int $zoom): self
    {
        $this->controls['zoom'] = $zoom;

        return $this;
    }

    /**
     * Set max zoom
     *
     * @return $this
     *
     * @note Default value 20
     */
    public function maxZoom(int $maxZoom): self
    {
        $this->controls['maxZoom'] = $maxZoom;

        return $this;
    }

    /**
     * Set min zoom
     *
     * @param  int  $maxZoom
     * @return $this
     *
     * @note Default value 1
     */
    public function minZoom(int $minZoom): self
    {
        $this->controls['minZoom'] = $minZoom;

        return $this;
    }

    /**
     * Determine if marker is visible or not.
     *
     * @return $this
     *
     * @note Default value is false
     */
    public function showMarker(bool $show = true): self
    {
        $this->mapConfig['showMarker'] = $show;

        return $this;
    }

    /**
     * Set tiles url
     *
     * @return $this
     */
    public function tilesUrl(string $url): self
    {
        $this->mapConfig['tilesUrl'] = $url;

        return $this;
    }

    /**
     * Determine if zoom box is visible or not.
     *
     * @return $this
     */
    public function showZoomControl(bool $show = true): self
    {
        $this->controls['zoomControl'] = $show;

        return $this;
    }

    /**
     * Determine if fullscreen box is visible or not.
     *
     * @return $this
     */
    public function showFullscreenControl(bool $show = true): self
    {
        $this->controls['fullscreenControl'] = $show;

        return $this;
    }

    /**
     * Change the marker color.
     *
     * @return $this
     */
    public function markerColor(string $color): self
    {
        $this->mapConfig['markerColor'] = $color;

        return $this;
    }

    /**
     * Enable or disable live location updates for the map.
     *
     * @return $this
     */
    public function liveLocation(bool $send = true): self
    {
        $this->mapConfig['liveLocation'] = $send;

        return $this;
    }

    /**
     * Append extra controls to be passed to leaflet map object
     *
     * @return $this
     */
    public function extraControl(array $control): self
    {
        $this->extraControls = array_merge($this->extraControls, $control);

        return $this;
    }

    /**
     * Append extra controls to be passed to leaflet tileLayer object
     *
     * @return $this
     */
    public function extraTileControl(array $control): self
    {
        $this->mapConfig = array_merge($this->mapConfig, $control);

        return $this;
    }

    /**
     * Setup function
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->default(['lat' => 0, 'lng' => 0]);
    }
}
