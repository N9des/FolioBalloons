uniform float uTime;
uniform float uIndex;
uniform float uSpeeds[4];

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	modelPosition.y += sin(modelPosition.y * uTime * uSpeeds[int(uIndex)] ) * 0.03;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;
}