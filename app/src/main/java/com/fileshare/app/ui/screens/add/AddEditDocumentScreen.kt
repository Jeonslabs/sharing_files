package com.fileshare.app.ui.screens.add

import android.Manifest
import android.net.Uri
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.fileshare.app.domain.model.Category
import com.fileshare.app.domain.model.Document
import com.fileshare.app.ui.components.FilePreviewCard
import com.fileshare.app.util.FileUtils
import com.fileshare.app.util.PdfUtils
import com.fileshare.app.viewmodel.CategoryViewModel
import com.fileshare.app.viewmodel.DocumentViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditDocumentScreen(
    documentId: Long?,
    documentViewModel: DocumentViewModel,
    categoryViewModel: CategoryViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val isEditMode = documentId != null
    val categories by categoryViewModel.categories.collectAsState()

    // Form state
    var title by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf<Long?>(null) }
    var memo by remember { mutableStateOf("") }
    var imageUriList by remember { mutableStateOf<List<Uri>>(emptyList()) }
    var savedImagePaths by remember { mutableStateOf<List<String>>(emptyList()) }
    var fileTypes by remember { mutableStateOf<List<String>>(emptyList()) } // Track file types
    var showImagePicker by remember { mutableStateOf(false) }
    var showCategoryPicker by remember { mutableStateOf(false) }
    var showPermissionDialog by remember { mutableStateOf(false) }

    // Set default category
    LaunchedEffect(categories) {
        if (selectedCategoryId == null && categories.isNotEmpty()) {
            selectedCategoryId = categories.first().id
        }
    }

    // Load existing document if editing
    LaunchedEffect(documentId) {
        if (documentId != null) {
            documentViewModel.getDocumentById(documentId).collect { doc ->
                doc?.let {
                    title = it.title
                    selectedCategoryId = it.categoryId
                    memo = it.memo ?: ""
                    savedImagePaths = it.imageUris
                }
            }
        }
    }

    // Permission launcher
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.values.all { it }
        if (!allGranted) {
            showPermissionDialog = true
        }
    }

    // Multi-file picker launcher (images + PDF)
    val multiFilePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris: List<Uri> ->
        uris.forEach { uri ->
            if (PdfUtils.isPdf(uri, context)) {
                // PDF file
                val fileName = FileUtils.generateFileName("pdf", "pdf")
                val savedPath = PdfUtils.copyPdfToInternalStorage(context, uri, fileName)
                savedPath?.let { path ->
                    savedImagePaths = savedImagePaths + path
                    fileTypes = fileTypes + "PDF"
                }
            } else {
                // Image file
                imageUriList = imageUriList + uri
            }
        }
    }

    // Camera launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        bitmap?.let {
            val fileName = FileUtils.generateFileName("photo", "jpg")
            val savedPath = FileUtils.saveBitmapToInternalStorage(context, it, fileName)
            savedPath?.let { path ->
                savedImagePaths = savedImagePaths + path
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        if (isEditMode) "문서 수정" else "새 문서 추가",
                        style = MaterialTheme.typography.titleLarge
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "뒤로")
                    }
                },
                actions = {
                    Button(
                        onClick = {
                            if (title.isNotBlank() && selectedCategoryId != null) {
                                val allImagePaths = mutableListOf<String>()
                                
                                // Save new images
                                imageUriList.forEach { uri ->
                                    val fileName = FileUtils.generateFileName("doc")
                                    val savedPath = FileUtils.saveFileToInternalStorage(context, uri, fileName)
                                    savedPath?.let { allImagePaths.add(it) }
                                }
                                
                                // Add existing saved images
                                allImagePaths.addAll(savedImagePaths)
                                
                                if (allImagePaths.isNotEmpty()) {
                                    val document = Document(
                                        id = documentId ?: 0,
                                        title = title,
                                        categoryId = selectedCategoryId!!,
                                        imageUris = allImagePaths,
                                        memo = memo.ifBlank { null },
                                        fileSizeBytes = allImagePaths.sumOf { FileUtils.getFileSize(it) },
                                        mimeType = "image/jpeg",
                                        createdAt = if (isEditMode) 0 else System.currentTimeMillis(),
                                        updatedAt = System.currentTimeMillis()
                                    )

                                    if (isEditMode) {
                                        documentViewModel.updateDocument(document)
                                    } else {
                                        documentViewModel.addDocument(document)
                                    }
                                    onNavigateBack()
                                }
                            }
                        },
                        modifier = Modifier.padding(end = 8.dp),
                        enabled = title.isNotBlank() && selectedCategoryId != null && (imageUriList.isNotEmpty() || savedImagePaths.isNotEmpty())
                    ) {
                        Text("저장")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(24.dp), // 패딩 증가
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Image Section
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "이미지 및 문서", 
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.secondary
                )
                
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        OutlinedCard(
                            modifier = Modifier
                                .size(100.dp)
                                .clickable { showImagePicker = true },
                            colors = CardDefaults.outlinedCardColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                            ),
                            shape = MaterialTheme.shapes.medium,
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary)
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        Icons.Default.AddAPhoto, 
                                        null, 
                                        modifier = Modifier.size(28.dp),
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        "추가", 
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }
                    }

                    // Show saved files (images and PDFs)
                    itemsIndexed(savedImagePaths) { index, path ->
                        val isPdf = fileTypes.getOrNull(index) == "PDF"
                        FilePreviewCard(
                            filePath = path,
                            isPdf = isPdf,
                            onDelete = {
                                savedImagePaths = savedImagePaths.filterIndexed { i, _ -> i != index }
                                fileTypes = fileTypes.filterIndexed { i, _ -> i != index }
                            }
                        )
                    }
                    
                    // Show newly selected images
                    itemsIndexed(imageUriList) { index, uri ->
                        ImageItemCard(
                            imageData = uri,
                            onDelete = {
                                imageUriList = imageUriList.filterIndexed { i, _ -> i != index }
                            }
                        )
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            // Info Section
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    "문서 정보", 
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.secondary
                )

                // Title
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("문서 제목 *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline
                    )
                )

                // Category
                val selectedCategory = categories.find { it.id == selectedCategoryId }
                OutlinedCard(
                    onClick = { showCategoryPicker = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                "카테고리 *", 
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.outline
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                selectedCategory?.name ?: "카테고리 선택",
                                style = MaterialTheme.typography.bodyLarge,
                                color = if (selectedCategoryId != null) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Icon(Icons.Default.ArrowDropDown, null, tint = MaterialTheme.colorScheme.outline)
                    }
                }

                // Memo
                OutlinedTextField(
                    value = memo,
                    onValueChange = { memo = it },
                    label = { Text("메모 (선택)") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 120.dp),
                    maxLines = 5,
                    shape = MaterialTheme.shapes.medium
                )
            }
        }
    }

    // Image Picker Bottom Sheet
    if (showImagePicker) {
        ModalBottomSheet(
            onDismissRequest = { showImagePicker = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                ListItem(
                    headlineContent = { Text("카메라로 촬영") },
                    leadingContent = { Icon(Icons.Default.CameraAlt, null) },
                    modifier = Modifier.clickable {
                        val permissions = arrayOf(Manifest.permission.CAMERA)
                        permissionLauncher.launch(permissions)
                        cameraLauncher.launch(null)
                        showImagePicker = false
                    }
                )
                ListItem(
                    headlineContent = { Text("갤러리에서 선택") },
                    leadingContent = { Icon(Icons.Default.PhotoLibrary, null) },
                    modifier = Modifier.clickable {
                        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            arrayOf(Manifest.permission.READ_MEDIA_IMAGES)
                        } else {
                            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
                        }
                        permissionLauncher.launch(permissions)
                        multiFilePickerLauncher.launch("*/*") // Allow images and PDFs
                        showImagePicker = false
                    }
                )
            }
        }
    }

    // Category Picker Bottom Sheet
    if (showCategoryPicker) {
        ModalBottomSheet(
            onDismissRequest = { showCategoryPicker = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                categories.forEach { cat ->
                    ListItem(
                        headlineContent = { Text(cat.name) },
                        leadingContent = {
                            RadioButton(
                                selected = selectedCategoryId == cat.id,
                                onClick = { selectedCategoryId = cat.id }
                            )
                        },
                        modifier = Modifier.clickable {
                            selectedCategoryId = cat.id
                            showCategoryPicker = false
                        }
                    )
                }
            }
        }
    }

    // Permission Dialog
    if (showPermissionDialog) {
        AlertDialog(
            onDismissRequest = { showPermissionDialog = false },
            title = { Text("권한이 필요합니다") },
            text = { Text("카메라 및 저장소 권한이 필요합니다. 설정에서 권한을 허용해주세요.") },
            confirmButton = {
                TextButton(onClick = { showPermissionDialog = false }) {
                    Text("확인")
                }
            }
        )
    }
}

@Composable
private fun ImageItemCard(
    imageData: Any, // Can be Uri or File
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.size(120.dp)
    ) {
        Box(
            modifier = Modifier.fillMaxSize()
        ) {
            AsyncImage(
                model = imageData,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            IconButton(
                onClick = onDelete,
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(
                    Icons.Default.Close,
                    "삭제",
                    tint = MaterialTheme.colorScheme.onError,
                    modifier = Modifier
                        .size(24.dp)
                )
            }
        }
    }
}
