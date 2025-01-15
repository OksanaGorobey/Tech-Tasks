<?php

$randomArray = array_map(function () {
    return rand();
}, range(1, 20));

function randSort($randomArray)
{
    $result = [];
    $length = count($randomArray);

    if ($length <= 1) {
        return $randomArray;
    }

    $midInt = intval($length / 2);
    $left = randSort(array_slice($randomArray, 0, $midInt));
    $right = randSort(array_slice($randomArray, $midInt));

    while (count($left) > 0 && count($right) > 0) {
        if ($left[0] <= $right[0]) {
            $result[] = array_shift($left);
        } else {
            $result[] = array_shift($right);
        }
    }

    return array_merge($result, $left, $right);
}

$notRandomArray = randSort($randomArray);
