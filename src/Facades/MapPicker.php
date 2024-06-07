<?php

declare(strict_types=1);

namespace Deka\MapPicker\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Dotswan\MapPicker\MapPicker
 */
class MapPicker extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Deka\MapPicker\MapPicker::class;
    }
}
