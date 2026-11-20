/**
 * Scelte condivise fra il testo HTML e la scena 3D: un click su un monitor o
 * su un pulsante del pannello di testo cambia la stessa cosa.
 */
export type WorldSelection = {
  /** Indice del progetto in primo piano. */
  project: number
  setProject: (index: number) => void
  /** Apre i dettagli del progetto in primo piano nel pannello di testo. */
  openProjectDetails: () => void
  /** `true` quando la foto del profilo mostra il retro illustrato. */
  photoBack: boolean
  togglePhoto: () => void
  /** Id della tappa del percorso selezionata. */
  entry: string
  setEntry: (id: string) => void
  /** Id del gruppo di competenze selezionato. */
  group: string
  setGroup: (id: string) => void
  /** Id dell'interesse "sul piatto". */
  playing: string
  setPlaying: (id: string) => void
}
