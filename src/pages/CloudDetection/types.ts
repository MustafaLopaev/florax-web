export interface IPredictFlowerRoboflowApi {
  outputs: Output[];
  profiler_trace: any[];
}

export interface Output {
  predictions: Predictions;
}

export interface Predictions {
  image: Image;
  predictions: Prediction[];
}

export interface Image {
  width: number;
  height: number;
}

export interface Prediction {
  width: number;
  height: number;
  x: number;
  y: number;
  confidence: number;
  class_id: number;
  class: string;
  detection_id: string;
  parent_id: string;
}
