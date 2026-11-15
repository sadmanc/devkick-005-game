"""Shared chart style: Okabe-Ito colour-blind-safe palette, one colour per accent."""
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
CHARTS = HERE.parent / 'charts'
RESULTS = HERE.parent / 'results'
DATA = Path('/home/ubuntu/accent-data')
ACCENTS = ['Scottish', 'Canadian', 'American', 'Indian', 'English']
LABEL = dict(Scottish='Scottish', Canadian='Canadian', American='American (US)',
             Indian='Indian English', English='Southern English')
COLOR = dict(Scottish='#0072B2', Canadian='#D55E00', American='#009E73',
             Indian='#CC79A7', English='#E69F00')
plt.rcParams.update({'figure.dpi': 130, 'savefig.dpi': 130, 'font.size': 10,
                     'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.titleweight': 'bold'})


def save(fig, name, source):
    fig.text(0.01, 0.005, source, fontsize=7, color='#555')
    fig.savefig(CHARTS / name, bbox_inches='tight')
    plt.close(fig)
    print('wrote', name)
