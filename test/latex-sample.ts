export const samplePapersWithLatex = [
  {
    title: "Exploring Quantum Gravity: The $\\Psi$ Function and Einstein's Field Equations",
    link: "https://arxiv.org/abs/2301.12345",
    abstract: "We present a novel approach to quantum gravity by exploring the relationship between the wave function $\\Psi$ and Einstein's field equations. Our work builds on the framework where $R_{\\mu\\nu} - \\frac{1}{2}R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$. Using numerical simulations, we demonstrate that quantum fluctuations at the Planck scale ($\\ell_P = \\sqrt{\\frac{\\hbar G}{c^3}}$) can be reconciled with general relativity through a modified action principle where $S = \\int d^4x \\sqrt{-g} (R - 2\\Lambda + \\mathcal{L}_{\\text{matter}})$.",
    authors: ["Alice Johnson", "Robert Smith", "Chen Wei"],
    categories: ["gr-qc", "hep-th", "quant-ph"],
    publishDate: "2023-01-15",
    announceType: "new"
  },
  {
    title: "Statistical Analysis of Deep Neural Networks using $L^p$ Norm Regularization",
    link: "https://arxiv.org/abs/2302.54321",
    abstract: "Deep neural networks have demonstrated remarkable success across various domains. In this paper, we investigate the effects of using $L^p$ norm regularization on model performance. We analyze networks with loss functions of the form $\\mathcal{L}(\\theta) = \\mathcal{L}_0(\\theta) + \\lambda \\|\\theta\\|_p^p$ where $p \\in [1,2]$. Our experiments show that for $p = 1.5$, networks achieve a balance between sparsity and stability, yielding a test accuracy improvement of $\\Delta = 3.2\\%$ compared to standard methods. We provide theoretical guarantees through PAC-Bayesian bounds of the form $\\mathbb{P}\\left(\\mathbb{E}[\\mathcal{L}] \\leq \\hat{\\mathcal{L}} + \\sqrt{\\frac{\\text{KL}(Q\\|P) + \\ln\\frac{2\\sqrt{n}}{\\delta}}{2n}}\\right) \\geq 1 - \\delta$.",
    authors: ["David Lee", "Emma Wilson", "Mohammed Al-Farsi"],
    categories: ["cs.LG", "stat.ML", "cs.AI"],
    publishDate: "2023-02-22",
    announceType: "new"
  },
  {
    title: "The Thermodynamic Limit of Quantum Many-Body Systems",
    link: "https://arxiv.org/abs/2303.98765",
    abstract: "We study the thermodynamic limit of quantum many-body systems with long-range interactions. Consider a system of $N$ particles with Hamiltonian $H = \\sum_{i < j}^N V(r_{ij})$, where $V(r) \\sim 1/r^\\alpha$ at large distances. We prove that for $\\alpha > d$, where $d$ is the spatial dimension, the energy per particle converges to a finite value as $N \\to \\infty$. We use techniques from statistical mechanics, particularly the partition function $Z = \\text{Tr}(e^{-\\beta H})$ and the free energy $F = -\\frac{1}{\\beta}\\ln Z$. Our results have implications for understanding phase transitions in quantum systems, where the order parameter $\\langle \\hat{O} \\rangle = \\frac{1}{Z}\\text{Tr}(\\hat{O}e^{-\\beta H})$ exhibits critical behavior.",
    authors: ["Sophia Rodriguez", "James Williams", "Li Xiu"],
    categories: ["cond-mat.stat-mech", "quant-ph", "math-ph"],
    publishDate: "2023-03-10",
    announceType: "new"
  }
];