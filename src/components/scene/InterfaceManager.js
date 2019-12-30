
export class StateManager {
    constructor() {
      this.isGridOn = true;
      //
      this.orbitViewMode = true;
      //
      this.selectMode = false;
      this.isObjectSelected = false;
      this.selectedObject = null;
      //
      this.DragMode = false;
      this.isObjectDragged = false;
      this.draggedObject = null;
    }
}

