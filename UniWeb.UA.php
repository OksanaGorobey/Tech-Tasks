<?php

// Technical Task
// Create a timebased key-value store class TimeMap, that supports two operations.
//
//1. set(string key, string value)
//
//Stores the key and value
//
//2. get(string key, int timestamp)
//
//Returns a latest value that set(key, value) was called before that.
//
//If there are no values, it returns NULL
//

/**
 * Class TimeMap
 */
class TimeMap
{
    private const CHUNK_ARRAY = 30;

    /**  @var int|null */
    private ?int $start_time;

    /** @var array
     *
     * [
     *     key =>
     *     [
     *         timestamp => value,
     *         ...
     *     ],
     *     ...
     * ]
     *
     */
    private array $data = [];

    /** TimeMap constructor.*/
    public function __construct()
    {
        $this->start_time = \time();
    }

    /**
     * Stores the key and value with the current timestamp at the time of writing
     *
     * @param string $key
     * @param string $value
     * @throws Exception
     */
    public function set( string $key, string $value ): void
    {
        if( $value === '' )
        {
            throw new \Exception( 'Can`t be set empty value' );
        }

        $this->data[ $key ?: '0' ][ \time() ] = $value;
    }

    /**
     * Returns a latest value that set(key, value) was called before that.
     *
     * @param string $key
     * @param int $timestamp
     * @return string|null
     */
    public function get( string $key, int $timestamp ): ?string
    {
        // array by key
        $arr = $this->data[ $key ] ?? [];

        // if empty key or array has not key,
        // if time smaller than time of Initialization object or time unreal
        if( $key === '' ||
            empty( $arr ) ||
            $timestamp < $this->start_time ||
            !( ($timestamp <= PHP_INT_MAX) && ($timestamp >= ~PHP_INT_MAX) )
        )
        {
            return NULL;
        }

        $val = $arr[ $timestamp ] ?? null;

        // if array by key with timestamp has not $timestamp key
        if( $val === null )
        {
            // get all keys( timestamps )
            $keys = array_keys( $arr );

            $key_val = $this->searchClosestValue( $keys, $timestamp );

            $val = $arr[ $key_val ];
        }

        return $val;
    }

    /**
     * Search the most closes value for timestamp
     *
     * @param array $arr
     * @param int $timestamp
     * @return int
     */
    private function searchClosestValue(array $arr, int $timestamp ): int
    {
        // sort array by value
        sort( $arr );

        $result_array   = [];
        $array_lenght   = count( $arr );

        // middle key
        $mid_val        = $array_lenght/2;

        // if timestamp smaller then value of middle key take take left part of array
        // ( from 0 to middle key )
        if( $arr[ $mid_val ] > $timestamp )
        {
            $result_array = array_slice( $arr, 0, $mid_val );
        }

        // if timestamp greatest then value of middle key take take right part of array
        // ( from middle key to last element )
        if( $arr[ $mid_val ] < $timestamp )
        {
            $result_array = array_slice( $arr, $mid_val );
        }

        // if slice array count number more then chunk number -> recursion
        if( count( $result_array ) > self::CHUNK_ARRAY )
        {
            $this->searchClosestValue( $result_array, $timestamp );
        }
        else
        {
            $result = null;

            // start keys by 0
            sort( $result_array );

            // why foreach?
            // if array with 4 elements time of execution was
            // foreach                      - 0.00233
            // sort/array_filter/count/end  - 0.00821
            // push/sort/array_search       - 0.00977
            foreach( $result_array as $value )
            {
                if( $value < $timestamp )
                {
                    $result = $value;
                }
                else
                {
                    break;
                }
            }

            return $result;
        }
    }
}