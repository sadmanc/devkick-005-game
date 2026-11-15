#!/usr/bin/env bash
# Forced-align the VCTK subset with Montreal Forced Aligner (english_us_arpa models).
# The US model is used for every accent: it finds where each phone is, it does not judge the accent.
set -euo pipefail
DATA=${DATA:-/home/ubuntu/accent-data}
ENV=${ENV:-$DATA/mamba/envs/align}
export PATH="$ENV/bin:$PATH"
MFA="$ENV/bin/mfa"
"$MFA" align --clean -j 6 --use_mp "$DATA/vctk-align-input" english_us_arpa english_us_arpa "$DATA/vctk-aligned"
