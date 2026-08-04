<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Data HSE Performance HARIAN. Dua hal dihitung otomatis (tidak diinput
 * manual), persis seperti versi Node.js sebelumnya:
 *
 *  1. Man-Hour hari itu   = (male_workers + female_workers) x working_hours
 *  2. TRIR & LTIF KUMULATIF, dihitung dari running total seluruh baris
 *     terurut tanggal naik sampai baris tsb:
 *       TRIR = (kumulatif near_miss+FAC+MTC+RWC+property_damage / kumulatif man-hour) x 200.000
 *       LTIF = (kumulatif LTI+fatality / kumulatif man-hour) x 1.000.000
 *
 * Karena ini kumulatif lintas baris, perhitungan dilakukan lewat
 * HsePerformance::computeAll() atas seluruh koleksi, bukan per baris.
 */
class HsePerformance extends Model
{
    protected $table = 'hse_performances';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d'];
    }

    const TRIR_BASE = 200000;
    const LTIF_BASE = 1000000;
    const DEFAULT_WORKING_HOURS = 8;

    public static function round2(float $n): float
    {
        return round($n, 2);
    }

    /**
     * @param  Collection<int,HsePerformance>  $rows
     * @return Collection<int,array> baris + field hasil hitung, terurut tanggal naik
     */
    public static function computeAll(Collection $rows): Collection
    {
        $sorted = $rows->sortBy('date')->values();

        $cum = [
            'man_hours' => 0, 'near_miss' => 0, 'fac' => 0, 'mtc' => 0,
            'rwc' => 0, 'property_damage' => 0, 'lti' => 0, 'fatality' => 0,
        ];

        return $sorted->map(function (self $row) use (&$cum) {
            $male = (int) $row->male_workers;
            $female = (int) $row->female_workers;
            $workingHours = (int) ($row->working_hours ?: self::DEFAULT_WORKING_HOURS);

            $manHoursToday = ($male + $female) * $workingHours;

            $cum['man_hours'] += $manHoursToday;
            $cum['near_miss'] += (int) $row->near_miss;
            $cum['fac'] += (int) $row->first_aid_case;
            $cum['mtc'] += (int) $row->medical_treatment_case;
            $cum['rwc'] += (int) $row->restricted_work_case;
            $cum['property_damage'] += (int) $row->property_damage;
            $cum['lti'] += (int) $row->lost_time_incident;
            $cum['fatality'] += (int) $row->fatality;

            $trirNumerator = $cum['near_miss'] + $cum['fac'] + $cum['mtc'] + $cum['rwc'] + $cum['property_damage'];
            $ltifNumerator = $cum['lti'] + $cum['fatality'];

            $trir = $cum['man_hours'] > 0 ? self::round2(($trirNumerator / $cum['man_hours']) * self::TRIR_BASE) : 0;
            $ltif = $cum['man_hours'] > 0 ? self::round2(($ltifNumerator / $cum['man_hours']) * self::LTIF_BASE) : 0;

            return array_merge($row->toArray(), [
                'date' => $row->date->format('Y-m-d'),
                'working_hours' => $workingHours,
                'total_workers' => $male + $female,
                'man_hours_today' => $manHoursToday,
                'man_hours_cumulative' => $cum['man_hours'],
                'cumulative_near_miss' => $cum['near_miss'],
                'cumulative_first_aid_case' => $cum['fac'],
                'cumulative_medical_treatment_case' => $cum['mtc'],
                'cumulative_restricted_work_case' => $cum['rwc'],
                'cumulative_property_damage' => $cum['property_damage'],
                'cumulative_lost_time_incident' => $cum['lti'],
                'cumulative_fatality' => $cum['fatality'],
                'trir' => $trir,
                'ltif' => $ltif,
            ]);
        });
    }
}
