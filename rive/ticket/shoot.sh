#!/bin/sh
# usage: ./shoot.sh  -> renders frames of idle/send/arrive at 2x on a mist backdrop into build/frames
cd "$(dirname "$0")"
python3 gen.py --preview >/dev/null
OUT=${OUT:-build/frames}; mkdir -p $OUT
{
  echo "viewport 800x840"; echo "fit contain"
  echo "advance 2"; echo "screenshot $OUT/idle.png"
  echo "data send=1"; prev=0
  for t in ${SEND_T:-0 15 30 45 60 75 90 105 120 135}; do d=$((t-prev)); [ $d -gt 0 ] && echo "advance $d"; echo "screenshot $OUT/send_$(printf %03d $t).png"; prev=$t; done
  echo "data arrive=1"; prev=0
  for t in ${ARR_T:-0 15 30 40 50 60 70 80 90 100 115 137}; do d=$((t-prev)); [ $d -gt 0 ] && echo "advance $d"; echo "screenshot $OUT/arrive_$(printf %03d $t).png"; prev=$t; done
  echo quit
} | ~/.rive/bin/rive . --commands 2>/dev/null | grep -v "^ok" 
python3 gen.py >/dev/null
